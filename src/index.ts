import * as OneInch from "./OneInch";
import * as ZeroX from "./ZeroX";
import * as ParaSwap from "./ParaSwap";
import * as KyberSwap from "./KyberSwap";
import * as LiFi from "./LiFi";
import * as Socket from "./Socket";

import { Aggregator, AggregatorId, ISwapperParams } from "./types";

export const aggregatorById: { [key: string]: Aggregator } = {
  [AggregatorId.ONE_INCH]: <Aggregator>OneInch,
  [AggregatorId.ZERO_X]: <Aggregator>ZeroX,
  [AggregatorId.PARASWAP]: <Aggregator>ParaSwap,
  [AggregatorId.KYBERSWAP]: <Aggregator>KyberSwap,
  [AggregatorId.LIFI]: <Aggregator>LiFi,
  [AggregatorId.SOCKET]: <Aggregator>Socket,
};

export async function getCallData(o: ISwapperParams): Promise<string> {
  o.aggregatorId ??= AggregatorId.LIFI;
  const aggregator = aggregatorById[o.aggregatorId];
  return await aggregator.getCallData(o);
}

export function shortAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function compactWei(wei: number) {
  wei = Math.round(wei/1e4) * 1e4;
  return wei.toExponential().replace(/\.0+e/, 'e');
}

export function swapperParamsToString(o: ISwapperParams, callData?: string) {
  return `swap: ${o.inputChainId}:${shortAddress(o.input)} (${Number(o.amountWei)} wei) -> ${
      o.outputChainId ?? o.inputChainId}${shortAddress(o.output)}${
        callData ? ` (callData: ${callData.substring(0, 32)}... ${callData.length}bytes)` : ""}`;
}
