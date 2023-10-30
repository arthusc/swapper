import { TransactionRequest, isAddress } from "ethers";
import {
  ISwapperParams,
  validateQuoteParams,
  weiToString,
} from "../types";
import qs from "qs";

// 1inch specific types
interface IRouteData {
  toAmount: string;
  tx: TransactionRequest;
}

// cf. https://github.com/1inch/limit-order-protocol-utils/blob/master/src/limit-order-protocol.const.ts
export const routerByChainId: { [id: number]: string } = {
  1: "0x1111111254eeb25477b68fb85ed929f73a960582",
  10: "0x1111111254eeb25477b68fb85ed929f73a960582",
  56: "0x1111111254eeb25477b68fb85ed929f73a960582",
  100: "0x1111111254eeb25477b68fb85ed929f73a960582",
  137: "0x1111111254eeb25477b68fb85ed929f73a960582",
  250: "0x1111111254eeb25477b68fb85ed929f73a960582",
  324: "0x6e2b76966cbd9cf4cc2fa0d76d24d5241e0abc2f", // zksync cmon ser
  8217: "0x1111111254eeb25477b68fb85ed929f73a960582",
  8453: "0x1111111254eeb25477b68fb85ed929f73a960582",
  42161: "0x1111111254eeb25477b68fb85ed929f73a960582",
  43114: "0x1111111254eeb25477b68fb85ed929f73a960582",
  1313161554: "0x1111111254eeb25477b68fb85ed929f73a960582",
};

const apiKey = process.env?.ONE_INCH_API_KEY;
const apiRoot = "https://api.1inch.dev/swap/v5.2";

interface IQuoteParams {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
  disableEstimate: boolean;
  protocols?: string[];
  gasPrice?: string;
  gasLimit?: string;
  complexityLevel?: number;
  pairs?: string[];
  mainRouteParts?: string[];
  parts?: string[];
  includeGas: boolean;
  compatibility: boolean;
  includeProtocols?: boolean;
  connectorTokens?: string[];
  destReceiver?: string;
  referrer?: string;
  allowPartialFill?: boolean;
}

const convertParams = (o: ISwapperParams): IQuoteParams => ({
  src: o.input,
  dst: o.output,
  amount: weiToString(o.amountWei),
  from: o.payer,
  slippage: (o.maxSlippage ?? 0) * 100 || 10, // bps
  disableEstimate: true,
  includeGas: true,
  compatibility: false,
});

// NB: prefer using token unwrapped symbols (eg. weth->eth) to avoid missing/poor data feeds
export async function getCallData(o: ISwapperParams): Promise<IRouteData> {
  if (!apiKey) throw new Error("missing env.ONE_INCH_API_KEY");
  if (!validateQuoteParams(o)) throw new Error("invalid input");
  const params = convertParams(o);
  const res = await fetch(`${apiRoot}/${o.inputChainId}/swap?${qs.stringify(params)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );
  const data = await res.json();
  return data?.tx?.data;
}

export async function getQuote(o: ISwapperParams): Promise<number> {
  if (!apiKey) throw new Error("missing env.ONE_INCH_API_KEY");
  if (!validateQuoteParams(o)) throw new Error("invalid input");
  const res = await fetch(
    `${apiRoot}/${o.inputChainId}/quote?${qs.stringify(convertParams(o))}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );
  return await res.json();
}
