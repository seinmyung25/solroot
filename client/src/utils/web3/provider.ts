import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from "@ethersproject/providers"

export const getProvider = (provider: ExternalProvider | JsonRpcFetchFunc) => {
  const web3Provider = new Web3Provider(provider);
  web3Provider.pollingInterval = 1000;
  return web3Provider;
}