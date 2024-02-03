import SolrootParent from '@/abi/SolRootParent.json'
import SolrootERC1155 from '@/abi/ERC1155.json'
import SolrootERC20 from '@/abi/ERC20.json'
import { InstructionType } from "@/types/Instructions";
import { ethers } from "ethers";

export const getContractByName = (contract: string | undefined) => {
  switch (contract) {
    case "ERC20": {
      return SolrootERC20;
    }
    case "ERC1155": {
      return SolrootERC1155;
    }
    case "PARENT": {
      return SolrootParent;
    }
    default: {
      return undefined;
    }
  }
};

export const getDeployedContract = (
  address: string,
  abi: string,
  signer: ethers.Signer | undefined
) => {
  const contract = new ethers.Contract(address, abi, signer);

  return contract;
};

export const getCorrectProps = (
  instruction: InstructionType,
  method: string[]
): number => {
  let status = false;
  let i = 0;

  while (i < method.length) {
    if (instruction.name + "()" === method[i]) {
      status = true;
      break;
    }
    i++;
  }

  if (!status) return -1;
  return i;
};

export const getContractTypeByName = (address: string) => {
  const _contracts = Object.entries(localStorage);
  const contractName = _contracts.filter((el: string[]) => {
    return el[1].includes(address) ? el[0] : undefined;
  });

  return contractName[0][0];
};

export const getImpleContract = (
  address: string,
  contract: string | undefined,
  signer: ethers.Signer | undefined
) => {
  if (!contract || !signer) {
    return null;
  }
  const _contract = new ethers.Contract(address, contract, signer);

  const _getImpleContract = async () => {
    return await _contract.implementation();
  };

  const imple = _getImpleContract();

  return imple;
};

export const getImpleContractParams = async (
  address: string | undefined,
  contract: string | undefined,
  signer: ethers.Signer | undefined
) => {
  if (!address || !contract || !signer) {
    return null;
  }
  const imple = await getImpleContract(address, contract, signer);
  if (!imple) {
    return null;
  }
  const contractName = getContractTypeByName(imple);

  const _contract = getContractByName(contractName.slice(8));
  return _contract;
};

export const getABIMethodInputParams = (
  abi: string,
  name: string
): InstructionType[] => {
  const _abi = JSON.parse(abi);

  return _abi.filter((el: InstructionType) => {
    if (el.name === name) {
      return el;
    }
  });
};
