<div align="center">
  <img height="200x" src="./swapper.png" />
  <h1>Swapper</h1>
  <p>
    <strong>by <a href="https://astrolab.fi">Astrolab<a></strong>
  </p>
  <p>
    <!-- <a href="https://github.com/AstrolabFinance/swapper/actions"><img alt="Build Status" src="https://github.com/AstrolabFinance/swapper/actions/workflows/tests.yaml/badge.svg" /></a> -->
    <a href="https://opensource.org/licenses/MIT"><img alt="License" src="https://img.shields.io/github/license/AstrolabFinance/swapper?color=3AB2FF" /></a>
    <a href="https://discord.gg/PtAkTCwueu"><img alt="Discord Chat" src="https://img.shields.io/discord/984518964371673140"/></a>
    <a href="https://docs.astrolab.fi"><img alt="Astrolab Docs" src="https://img.shields.io/badge/astrolab_docs-F9C3B3" /></a>
  </p>
</div>

Swapper is a powerful meta-aggregator project by Astrolab Finance, aimed at liquidity and bridge meta-aggregation. It is designed to facilitate and optimize the swapping process across various liquidity sources such as 1inch, 0x, KyberSwap, ParaSwap, Li.Fi, and Socket.

## Features

### Swapper SDK

Located in [`./src/index.ts`](https://github.com/AstrolabFinance/swapper/blob/main/src/index.ts), the Swapper SDK is a client code that allows the generation of bridge and/or swap transactionRequests or callData from the desired Aggregator. It can be used off-chain with libraries such as ethers or ethers-rs, or on-chain directly by passing the callData as a parameter to the Swapper.sol contract on the desired chain.

#### Supported Aggregators

- [1inch](https://github.com/AstrolabFinance/swapper/blob/main/src/OneInch/index.ts)
- [0x](https://github.com/AstrolabFinance/swapper/blob/main/src/ZeroX/index.ts)
- [KyberSwap](https://github.com/AstrolabFinance/swapper/blob/main/src/KyberSwap/index.ts)
- [ParaSwap](https://github.com/AstrolabFinance/swapper/blob/main/src/ParaSwap/index.ts)
- [Li.Fi](https://github.com/AstrolabFinance/swapper/blob/main/src/LiFi/index.ts)
- [Socket](https://github.com/AstrolabFinance/swapper/blob/main/src/Socket/index.ts)

### Swapper Contract

The [Swapper contract](https://github.com/AstrolabFinance/swapper/blob/main/contracts/Swapper.sol) is a secured proxy that allows generic callData to be executed on the requested aggregator's contract. It comes with features that enable the management of operational risks such as whitelisting of callers, tokens to be swapped from/to, and aggregator contracts.

## Getting Started

To start using Swapper, you can clone the repository and install the necessary dependencies. Follow the instructions in the code documentation for detailed guidance on how to implement and utilize the Swapper SDK and contract.

## Contributing

Contributions are welcome! Feel free to open an issue or create a pull request if you have any improvements or suggestions.
