import { ReactNode, useState } from "react";
import { ContractContext } from "@/context/contract/context";
import { Contracts } from "@/types/Contract";
import { ethers } from "ethers";

const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [contractName, setContractName] = useState<string[]>([]);
  const [contractAddress, setContractAddress] = useState<Contracts | undefined>(
    undefined
  );
  const [contractABI, setContractABI] = useState<string | undefined>(undefined);
  const [impleAddress, setImpleAddress] = useState<string | undefined>(
    undefined
  );
  const [impleABI, setImpleABI] = useState<string | undefined>(undefined);
  const [impleName, setImpleName] = useState<string | undefined>(undefined);
  const [impleContract, setImpleContract] = useState<
    ethers.Contract | undefined
  >(undefined);
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);

  const contextValue = {
    contractName,
    setContractName,
    contractAddress,
    setContractAddress,
    contractABI,
    setContractABI,
    impleAddress,
    setImpleAddress,
    impleABI,
    setImpleABI,
    impleName,
    setImpleName,
    impleContract,
    setImpleContract,
    signer,
    setSigner,
  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

export { ContractProvider };
