// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer, Contract } from "ethers";
import { ethers } from "hardhat";
import { AggregatorId } from "../../src/types";
import { aggregatorById } from "../../src";

export async function deploy(
  deployer: Signer,
  aggregatorId: AggregatorId.LIFI,
  networkId = 250,
): Promise<Contract> {
  const swapperContract = await ethers.getContractFactory("Swapper", deployer);
  const swapper = await swapperContract.deploy(aggregatorById[aggregatorId].routerByChainId[networkId]);
  await swapper.waitForDeployment();
  return swapper as Contract;
}
