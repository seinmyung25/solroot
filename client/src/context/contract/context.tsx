import { Dispatch, SetStateAction, createContext } from "react";
import { Contracts } from "@/types/Contract";
import { ethers } from "ethers";

export interface contractContext {
  contractName: string[];
  setContractName: Dispatch<SetStateAction<string[]>>;
  contractAddress: Contracts | undefined;
  setContractAddress: Dispatch<SetStateAction<Contracts | undefined>>;
  contractABI: string | undefined;
  setContractABI: Dispatch<SetStateAction<string | undefined>>;
  impleAddress: string | undefined;
  setImpleAddress: Dispatch<SetStateAction<string | undefined>>;
  impleABI: string | undefined;
  setImpleABI: Dispatch<SetStateAction<string | undefined>>;
  impleName: string | undefined;
  setImpleName: Dispatch<SetStateAction<string | undefined>>;
  impleContract: ethers.Contract | undefined;
  setImpleContract: Dispatch<SetStateAction<ethers.Contract | undefined>>;
  signer: ethers.Signer | undefined;
  setSigner: Dispatch<SetStateAction<ethers.Signer | undefined>>;
}

const defaultValue: contractContext = {
  contractName: [],
  setContractName: () => {},
  contractAddress: undefined,
  setContractAddress: () => {},
  contractABI: undefined,
  setContractABI: () => {},
  impleName: undefined,
  setImpleName: () => {},
  impleAddress: undefined,
  setImpleAddress: () => {},
  impleABI: undefined,
  setImpleABI: () => {},
  impleContract: undefined,
  setImpleContract: () => {},
  signer: undefined,
  setSigner: () => {},
};

const ContractContext = createContext(defaultValue);

export { ContractContext };
