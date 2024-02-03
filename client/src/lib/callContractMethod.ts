import { InstructionIOType } from "@/types/Instructions";
import { ethers } from "ethers";
import { Dispatch, SetStateAction } from "react";
import { setDeployedContract } from "@/lib/manageContract";
import { TransactionReceipt } from "ethers";

export const callContractMethod = async (
  argc: number,
  argv: string[],
  contract: ethers.BaseContract,
  method: any,
  callback: Dispatch<SetStateAction<string | number | boolean | undefined>>,
  isDeploy: boolean
) => {
  if (method) {
    let tx: any;

    const contractMethod = contract.getFunction(method.name);

    if (argc === 0) {
      tx = await contractMethod();
    } else {
      tx = await contractMethod(...argv);
    }
    console.log("tx", tx);

    if (isDeploy) {
      await parseDeployEvent(tx, tx.hash);
    }
    callback(tx.hash);
    return tx;
  }
};

export const convertStringToBytes = (
  types: InstructionIOType[],
  input: string[]
) => {
  const result = input.filter((el: string, idx: number) => {
    return types[idx].internalType.includes("bytes") ? atob(el) : el;
  });

  return result;
};

export const parseDeployEvent = async (
  receipt: ethers.TransactionReceipt,
  hash: string,
) => {
  const result: TransactionReceipt | null = await receipt.provider.waitForTransaction(hash);

  if (result) {
    setDeployedContract(result?.logs[0].address, "ERC20");
  }
};
