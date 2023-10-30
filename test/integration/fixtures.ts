import { Network } from "hardhat/types";
import { INetwork } from "../../src/types";
import { getNetwork } from "../../src/networks";

export async function resetNetwork(network: Network, target: INetwork|string|number) {

  target = getNetwork(target);
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: target.httpRpcs[0],
          networkId: target.id,
          //   blockNumber: xxx, // <-- comment out to use latest
        },
      },
    ],
  });
}

export async function revertNetwork(network: Network, snapshotId: any) {
  await network.provider.send("evm_revert", [snapshotId]);
}
