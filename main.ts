// cbBTC/USDC dip-rebound bot for make.fun's 24-hour BTC race (agent-fun/bars-replay/v1).
//
// Mostly in cash. It buys only after a sharp drop that has started to turn: the close at least
// DROP below the highest close of the last LOOKBACK bars, and up on the bar before. It then holds
// for a rebound and sells the whole position at TAKE_PROFIT over its cost, at STOP_LOSS under it,
// or after MAX_HOLD bars, whichever comes first. A full round trip costs about 26 bps, so it only
// trades moves well beyond that. The cost a position is measured against already carries the buy's
// fee, slippage and impact, so TAKE_PROFIT is a net gain at the close.
//
// The race ranks an entry with no trade below every entry with one. If no dip has come by
// GUARD_BAR, it buys the minimum notional once (about 0.003 USDC of fees), which the end of the
// window sells.

import { runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const LOOKBACK = 10;
const DROP = 0.012;
const TAKE_PROFIT = 0.010;
const STOP_LOSS = 0.015;
const MAX_HOLD = 240;
const MAX_SLIPPAGE_BPS = 100;
const GUARD_BAR = 1380;

const closes: number[] = [];
let heldSince = -1;
let traded = false;

function isDipTurning(): boolean {
  const n = closes.length;
  if (n <= LOOKBACK) return false;
  const last = closes[n - 1];
  let high = last;
  for (let i = n - 1 - LOOKBACK; i < n; i++) if (closes[i] > high) high = closes[i];
  return last / high - 1 <= -DROP && last > closes[n - 2];
}

function shouldExit(state: BarsState, symbol: string, qty: bigint, cost: bigint): boolean {
  const value = Number(state.value(symbol, qty));
  const r = value / Number(cost) - 1;
  return r >= TAKE_PROFIT || r <= -STOP_LOSS || closes.length - heldSince >= MAX_HOLD;
}

function buy(symbol: string, spend: bigint): BuyInput[] {
  traded = true;
  return [{ side: 'buy', symbol, notional_quote_units: spend, max_slippage_bps: MAX_SLIPPAGE_BPS }];
}

await runBars({
  onBatch(state, batch) {
    const symbol = state.hello.symbols[0].symbol;
    const bar = batch.bars.find((b) => b.symbol === symbol);
    if (bar === undefined) return [];
    closes.push(Number(bar.c));
    if (state.warmingUp) return [];
    if (batch.fills.length > 0) traded = true;

    const held = state.positions.get(symbol);
    if (held !== undefined) {
      if (heldSince < 0) heldSince = closes.length;
      if (!shouldExit(state, symbol, held.qty, held.cost)) return [];
      const sell: SellInput = { side: 'sell', symbol, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
      return [sell];
    }
    heldSince = -1;
    const minNotional = BigInt(state.hello.fees.min_notional_quote_units);
    if (isDipTurning()) {
      const byWeight = (BigInt(state.hello.caps.max_weight_bps) * state.equity) / 10_000n;
      const spend = state.cash < byWeight ? state.cash : byWeight;
      if (spend >= minNotional) return buy(symbol, spend);
    }
    if (!traded && closes.length >= GUARD_BAR && state.cash >= minNotional) return buy(symbol, minNotional);
    return [];
  },
});
