import {
  ISwapperParams,
  validateQuoteParams,
  weiToString,
} from "../types";

interface ISwapExchange {
  exchange: string;
  srcAmount: string;
  destAmount: string;
  percent: number;
  data: {
    router: string;
    path: string[];
    factory: string;
    initCode: string;
    feeFactor: number;
    pools: {
      address: string;
      fee: number;
      direction: boolean;
    }[];
    gasUSD: string;
  };
}

interface ISwap {
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  swapExchanges: ISwapExchange[];
}

interface IOther {
  exchange: string;
  srcAmount: string;
  destAmount: string;
  unit: string;
  data: {
    router: string;
    path: string[];
    factory: string;
    initCode: string;
    feeFactor: number;
    pools: {
      address: string;
      fee: number;
      direction: boolean;
    }[];
    gasUSD: string;
  };
}

interface IPriceRoute {
  blockNumber: number;
  network: number;
  srcToken: string;
  srcDecimals: number;
  srcAmount: string;
  destToken: string;
  destDecimals: number;
  destAmount: string;
  bestRoute: {
    percent: number;
    swaps: ISwap[];
  };
  others: IOther;
  gasCostUSD: string;
  gasCost: string;
  side: string;
  tokenTransferProxy: string;
  contractAddress: string;
  contractMethod: string;
  srcUSD: string;
  destUSD: string;
  partner: string;
  partnerFee: number;
  maxImpactReached: boolean;
  hmac: string;
}

interface IQuoteParams {
  srcToken: string;
  srcDecimals?: number;
  destToken: string;
  destDecimals?: number;
  srcAmount: string;
  priceRoute?: IPriceRoute;
  slippage?: number;
  userAddress: string;
  txOrigin?: string;
  receiver?: string;
  partner?: string; // project name
  partnerAddress?: string; // project treasury address for surplus
  takeSurplus?: boolean; // send positive slippage to partnerAddress (default: false)
  deadline?: number;
}

interface IQuoteData {
  from: string;
  to: string;
  value: number;
  data: string | Uint8Array;
  gasPrice: number;
  gas: number;
  chainId: number;
}

export const routerByChainId: { [id: number]: string } = {
  1: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  10: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  56: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  100: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  137: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  250: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  324: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57", // zksync cmon ser
  1101: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  8217: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  8453: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  42161: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  43114: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
};

const apiKey = process.env?.PARASWAP_API_KEY;
const apiRoot = "https://apiv5.paraswap.io";

const convertParams = (o: ISwapperParams): IQuoteParams => ({
  srcToken: o.input,
  destToken: o.output,
  srcAmount: weiToString(o.amountWei),
  userAddress: o.payer,
  receiver: o.receiver ?? o.payer,
  slippage: (o.maxSlippage ?? 0) * 100 || 10, // bps
  deadline: Math.floor(Date.now() / 1000) + 300, // 5min
});

// NB: prefer using token unwrapped symbols (eg. weth->eth) to avoid missing/poor data feeds
export async function getCallData(o: ISwapperParams): Promise<IQuoteData> {
  if (!validateQuoteParams(o)) throw new Error("invalid input");
  const priceRoute = await getRoute(o);
  const params = convertParams(o);
  const res = await fetch(
    `${apiRoot}/transactions/${o.inputChainId}?ignoreGasEstimate=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );
  return await res.json();
}

export async function getRoute(o: ISwapperParams): Promise<IPriceRoute> {
  if (!validateQuoteParams(o)) throw new Error("invalid input");
  const res = await fetch(
    `${apiRoot}/prices/${o.inputChainId}?srcToken=${o.input}&destToken=${
      o.output
    }&amount=${weiToString(o.amountWei)}`,
  );
  return await res.json();
}
