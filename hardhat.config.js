require("@nomiclabs/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

const accounts = process?.env?.HARDHAT_ACCOUNTS?.split(",") ?? [
    "0x9Ed7220b2b8Da70f57Ca85F72555D7B521f373D6"
];

const networks = require("./networks.json").reduce((acc, network) => {
    acc[network.slug] = {
        url: network.httpRpcs[0],
        chainId: network.id,
        accounts
    };
    return acc;
}, {
    hardhat: { accounts }
});

module.exports = {
  solidity: "0.8.22", // Specify the Solidity version
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test/integration"
  },
  networks
};
