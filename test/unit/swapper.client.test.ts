import * as dotenv from "dotenv";
dotenv.config({ override: true });

import { assert, expect } from "chai";
import { AggregatorId, ISwapperParams } from "../../src/types";
import { getCallData, swapperParamsToString } from "../../src";
import { networkById } from "../../src/networks";

const addresses = {
  ftm: {
    FRAX: "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355",
    WBTC: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
    WETH: "0x74b23882a30290451a17c44f4f05243b6b58c76d",
    FUSDT: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    LZUSDC: "0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf",
    AXLUSDC: "0x1b6382dbdea11d97f24495c9a90b7c88469134a4",
    WFTM: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    STFTM: "0x69c744D3444202d35a2783929a0F930f2FBB05ad",
    MIM: "0x82f0B8B456c1A451378467398982d4834b6829c1",
    MAI: "0xfB98B335551a418cD0737375a2ea0ded62Ea213b",
    // wallet containning lzusdc+wftm+wbtc+weth
    impersonate: "0x65bab4f268286b9005d6053a177948dddc29bad3",
  },
  op: {
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC Optimism
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI Optimism
    SYN: "0x5A5fFf6F753d7C11A56A52FE47a177a87e431655",
    VELO: "0x3c8B650257cFb5f272f799F5e2b4e65093a11a05",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  arb: {
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC Arbitrum
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH Arbitrum
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  }
};

const swapCases: ISwapperParams[] = [
// 1inch
{
  aggregatorId: AggregatorId.ONE_INCH,
  inputChainId: 250,
  input: addresses.ftm.LZUSDC,
  output: addresses.ftm.AXLUSDC,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.ONE_INCH,
  inputChainId: 250,
  input: addresses.ftm.AXLUSDC,
  output: addresses.ftm.FRAX,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.ONE_INCH,
  inputChainId: 250,
  input: addresses.ftm.FRAX,
  output: addresses.ftm.MIM,
  amountWei: 100 * 1e18,
  payer: addresses.ftm.impersonate
},
// 0x
{
  aggregatorId: AggregatorId.ZERO_X,
  inputChainId: 250,
  input: addresses.ftm.LZUSDC,
  output: addresses.ftm.AXLUSDC,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.ZERO_X,
  inputChainId: 250,
  input: addresses.ftm.AXLUSDC,
  output: addresses.ftm.FRAX,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.ZERO_X,
  inputChainId: 250,
  input: addresses.ftm.FRAX,
  output: addresses.ftm.MIM,
  amountWei: 100 * 1e18,
  payer: addresses.ftm.impersonate
},
// Socket
{
  aggregatorId: AggregatorId.SOCKET,
  inputChainId: 250,
  input: addresses.ftm.LZUSDC,
  output: addresses.ftm.AXLUSDC,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.SOCKET,
  inputChainId: 250,
  input: addresses.ftm.AXLUSDC,
  output: addresses.ftm.FRAX,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.SOCKET,
  inputChainId: 250,
  input: addresses.ftm.FRAX,
  output: addresses.ftm.MIM,
  amountWei: 100 * 1e18,
  payer: addresses.ftm.impersonate
},
// LIFI
{
  aggregatorId: AggregatorId.LIFI,
  inputChainId: 250,
  input: addresses.ftm.LZUSDC,
  output: addresses.ftm.AXLUSDC,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.LIFI,
  inputChainId: 250,
  input: addresses.ftm.AXLUSDC,
  output: addresses.ftm.FRAX,
  amountWei: 100 * 1e6,
  payer: addresses.ftm.impersonate
},{
  aggregatorId: AggregatorId.LIFI,
  inputChainId: 250,
  input: addresses.ftm.FRAX,
  output: addresses.ftm.MIM,
  amountWei: 100 * 1e18,
  payer: addresses.ftm.impersonate
}];

const filterCases = (id: AggregatorId) =>
  swapCases.filter(p => p.aggregatorId === id);

const getCallDataForCases = async (cases: ISwapperParams[]): Promise<(string|undefined)[]> => {
  const results = [];
  for (const params of cases) {
    // throttle 3sec
    await new Promise(resolve => setTimeout(resolve, 3000))
      .then(async () => {
        const callData = await getCallData(params);
        console.log(swapperParamsToString(params, callData));
        results.push(callData)
      });
  }
  return results;
}

const getCallDataByAggregatorCases = async (id: AggregatorId): Promise<(string|undefined)[]> =>
  await getCallDataForCases(filterCases(id));


describe("swapper.client.test", function () {
  this.beforeAll(async function () {
    console.log(`env: ${JSON.stringify(process.env)}`);
  });

  this.beforeEach(async function () {
    console.log("beforeEach");
  });

  describe("Get Quote", function () {
    it("1inch", async function () {
      for (const callData of (await getCallDataByAggregatorCases(AggregatorId.ONE_INCH)))
        expect(callData).to.be.a("string");
    });
    it("0x", async function () {
      for (const callData of (await getCallDataByAggregatorCases(AggregatorId.ZERO_X)))
        expect(callData).to.be.a("string");
    });
    it("Li.Fi", async function () {
      for (const callData of (await getCallDataByAggregatorCases(AggregatorId.LIFI)))
        expect(callData).to.be.a("string");
    });
    it("Socket", async function () {
      for (const callData of (await getCallDataByAggregatorCases(AggregatorId.SOCKET)))
        expect(callData).to.be.a("string");
    });
  })
});

