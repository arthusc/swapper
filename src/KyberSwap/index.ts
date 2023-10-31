import { isAddress } from "ethers";
import {
  ISwapperParams,
  validateQuoteParams,
  weiToString,
} from "../types";
import qs from "qs";

interface IQuoteParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  saveGas: boolean;
  includedSources?: string[];
  excludedSources?: string[];
  gasInclude?: boolean;
  gasPrice?: string;
  feeAmount?: string;
  chargeFeeBy?: string;
  isInBps?: boolean;
  feeReceiver?: string;
  source?: string;
  slippageTolerance?: number;
}

interface IExtraFee {
  feeAmount: string;
  chargeFeeBy: string;
  isInBps: boolean;
  feeReceiver: string;
}

interface IPoolExtra {
  swapFee: string;
}

interface IPool {
  pool: string;
  tokenIn: string;
  tokenOut: string;
  limitReturnAmount: string;
  swapAmount: string;
  amountOut: string;
  exchange: string;
  poolLength: number;
  poolType: string;
  poolExtra: IPoolExtra;
  extra: null;
}

interface IRouteSummary {
  tokenIn: string;
  amountIn: string;
  amountInUsd: string;
  tokenInMarketPriceAvailable: boolean;
  tokenOut: string;
  amountOut: string;
  amountOutUsd: string;
  tokenOutMarketPriceAvailable: boolean;
  gas: string;
  gasPrice: string;
  gasUsd: string;
  extraFee: IExtraFee;
  route: IPool[][];
}

interface IData {
  routeSummary: IRouteSummary;
  routerAddress: string;
}

export interface IQuoteData {
  code: number;
  message: string;
  data: IData;
  requestId: string;
}

export const networkById: { [id: number]: string } = {
  1: "ethereum",
  10: "optimism",
  56: "bsc",
  137: "polygon",
  250: "fantom",
  324: "zksync",
  1101: "polygon-zkevm",
  8453: "base",
  42161: "arbitrum",
  43114: "avalanche",
  59144: "linea",
  534352: "scroll",
  1313161554: "aurora",
};

// cf. https://docs.kyberswap.com/kyberswap-solutions/kyberswap-aggregator/contracts/aggregator-contract-addresses
export const routerByChainId: { [id: number]: string } = {
  1: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  10: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  25: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  56: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  137: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  250: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  324: "0x3F95eF3f2eAca871858dbE20A93c01daF6C2e923",
  1101: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  8217: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  8453: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  42161: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  42220: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  43114: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  59144: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  534352: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  1313161554: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
};

const apiKey = process.env?.KYBERSWAP_API_KEY;
const apiRoot = (networkId: number) =>
  `https://aggregator-api.kyberswap.com/${networkById[networkId]}/api/v1`;

const convertParams = (o: ISwapperParams): IQuoteParams => ({
  tokenIn: o.input,
  tokenOut: o.output,
  amountIn: weiToString(o.amountWei),
  saveGas: false,
  gasInclude: true,
  source: apiKey || o.project || "astrolab",
});

// NB: prefer using token unwrapped symbols (eg. weth->eth) to avoid missing/poor data feeds
export async function getCallData(o: ISwapperParams): Promise<IQuoteData> {
  if (!apiKey) throw new Error("missing env.KYBERSWAP_API_KEY");
  if (!validateQuoteParams(o)) throw new Error("invalid input");
  const params = convertParams(o);
  const routeSummary = (await getQuote(o))?.data?.routeSummary;
  const res = await fetch(
    `${apiRoot(o.inputChainId)}/route/build?${qs.stringify(o)}`,
    {
      method: "POST",
      body: JSON.stringify({
        routeSummary,
        recipient: o.receiver ?? o.payer,
        sender: o.payer,
        source: params.source,
        skipSimulateTx: true,
        slippageTolerance: o.maxSlippage ?? 0.01,
        deadline: Math.floor(Date.now() / 1000) + 300, // 5min,
      }),
      headers: {
        "x-client-id": params.source!,
        "Content-Type": "application/json",
      },
    },
  );
  return await res.json();
}

export async function getQuote(o: ISwapperParams): Promise<IQuoteData> {
  if (!apiKey) throw new Error("missing env.KYBERSWAP_API_KEY");
  if (!validateQuoteParams(o)) throw new Error("invalid input");
  const params = convertParams(o);
  const res = await fetch(
    `${apiRoot(o.inputChainId)}/routes?${qs.stringify(params)}`,
    {
      headers: { "x-client-id": params.source! },
    },
  );
  return await res.json();
}
