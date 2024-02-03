import { SetStateAction } from "react";
import { Dispatch } from "react";
import { ethers } from "ethers";
import { InstructionIOType } from "@/types/Instructions";
import { _isNumber, _isOnlyDigits } from "@/lib/handleInput";
import { setDeployedContract } from "@/lib/manageContract";
import { Addressable } from "ethers";

type Props = {
  contract: string;
  signer: ethers.Signer | undefined;
  params: string[];
  callback: Dispatch<SetStateAction<string | undefined>>;
  name: string | undefined;
};

export const deployContract = async ({
  contract,
  signer,
  params,
  callback,
  name,
}: Props) => {
  const _contract = JSON.parse(contract);
  const factory = new ethers.ContractFactory(
    _contract.abi,
    _contract.bytecode,
    signer
  );
  const address: string | Addressable | undefined = await deployByParams(factory, params);
  setDeployedContract(address as string, name);
  callback(address as string);
};

type ContractProps = {
  keys: InstructionIOType[];
  values: string[];
};

export const parseContractParams = ({ keys, values }: ContractProps) => {
  if (keys.length !== values.length) return;

  const result: Record<string, string | number> = {};

  for (let i = 0; i < keys.length; i++) {
    result[keys[i].name] = convertInt(keys[i].type, values[i]);
  }

  return result;
};

export const convertInt = (type: string, value: string) => {
  if (_isNumber(type) && _isOnlyDigits(value)) {
    return parseInt(value);
  }
  return value;
};

export const deployByParams = (
  contractFactory: ethers.ContractFactory,
  params: string[]
): Promise<string | Addressable | undefined> => {
  const _deployByParams = async () => {
    let Contract: ethers.BaseContract;
    try {
      if (params.length === 0) {
        Contract = await contractFactory.deploy();
      } else {
        Contract = await contractFactory.deploy(...params);
      }

      return Contract.target;
    } catch (e) {
      window.alert(e);
    }
  };
  const address = _deployByParams();
  return address;
};
