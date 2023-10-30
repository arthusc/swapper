import { isAddress } from "ethers";

export enum AggregatorId {
  ONE_INCH = "ONE_INCH",
  ZERO_X = "ZERO_X",
  KYBERSWAP = "KYBERSWAP",
  PARASWAP = "PARASWAP",
  LIFI = "LIFI",
  SOCKET = "SOCKET",
  ODOS = "ODOS",
}

export interface ISwapperParams {
  aggregatorId?: string;
  input: string;
  inputChainId: number;
  output: string;
  outputChainId?: number;
  amountWei: number;
  payer: string;
  receiver?: string;
  referrer?: string;
  project?: string; // == integrator
  deadline?: number;
  maxSlippage?: number;
}

export interface INetwork {
  name?: string;
  slug: string;
  landing?: string;
  blockNumber?: number;
  id: number;
  lzId?: number;
  lzEndpoint?: string;
  defiLlamaId?: string;
  httpRpcs: string[];
  wsRpcs?: string[];
  explorers?: string[];
  explorerApi?: string;
}

export type Aggregator = {
  routerByChainId: { [key: number]: string };
  getCallData: (o: ISwapperParams) => Promise<any>;
};

export const validateQuoteParams = (o: ISwapperParams) =>
  !(
    [o.input, o.output, o.payer].some((v) => !isAddress(v)) ||
    isNaN(o.inputChainId) ||
    o.inputChainId < 0 ||
    isNaN(o.amountWei) ||
    o.amountWei <= 0
  );

export const weiToString = (wei: number): string =>
  wei.toLocaleString("en-US").replace(/,/g, "");
