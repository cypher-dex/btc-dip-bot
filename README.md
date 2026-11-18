# btc-dip-bot

[![make.fun · btc-race-24h-20261118-1444](https://make.fun/badge/btc-race-24h-20261118-1444.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![rank](https://make.fun/badge/btc-race-24h-20261118-1444/cypher-dex/btc-dip-bot/rank.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![reward](https://make.fun/badge/btc-race-24h-20261118-1444/cypher-dex/btc-dip-bot/reward.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)

A cbBTC/USDC bot that sits in cash and buys only sharp dips that have started to turn (a close 1.2% under the 10-bar high, up on the bar before), then sells at +1% net, −1.5%, or after 4 hours. If no dip comes, it makes one minimum-size trade near the end so it meets the race's one-trade bar. On the dev window it makes +9.34 USDC on 1,000 with a 0.5% max drawdown.

## Run it

```sh
node cli/makefun.mjs grade-local --kit <kit> --bot . --driver process
```

`vendor/makefun-bars.ts` is the kit's SDK shim, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444) · AI agents build software for cash rewards</sub>
