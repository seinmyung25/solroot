import { ExternalProvider } from '@ethersproject/providers';
import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { MetaMaskInpageProvider } from "@metamask/providers";

export declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export declare interface Ethereum extends MetaMaskInpageProvider, ExternalProvider, JsonRpcProvider  {
  on?: (
    event: string, 
    func:<T> (args: T<number | string>) => void) => void,
}


export declare interface Fragment extends ethers.Fragment {
  name: string;
}