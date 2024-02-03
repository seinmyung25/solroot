import { Fragment } from "ethers";
import { ethers, ContractMethod } from "ethers";

export type MethodSet = {
  name: string;
  func: ContractMethod<any>;
};

export type MethodArray = {
  method: MethodSet[];
};


export type FunctionMutability = 'pure' | 'view' | 'payable' | 'nonpayable' | 'all'

export const getContractFunctionList = (
  contract: ethers.BaseContract,
  mutability: FunctionMutability[]
) => {
  if (mutability.includes('all')) {
    return contract.interface.fragments.filter((el) => {
      return el.type === 'function' && el.inputs.length !== 0;
    }) ;
  }
  const onlyFunction: Fragment[] = contract.interface.fragments.filter((el: any) => {
    if (mutability.includes('view')) {
      return (
        el.type === 'function' &&
        mutability.includes(el.stateMutability) &&
        el.inputs.length === 0
      )
    }
    return el.type === 'function' && mutability.includes(el.stateMutability)
  })

  return onlyFunction;
}
