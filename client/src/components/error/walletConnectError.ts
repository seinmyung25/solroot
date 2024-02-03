import { UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError, UserRejectedRequestError } from "@web3-react/injected-connector";

/**
 * @param error 
 * @description return error message as string
 * @returns string
 */
export const getErrorMsg = (error: Error | undefined) => {
  let errorMsg;

  switch(error?.constructor) {
    case NoEthereumProviderError:
      errorMsg = "No Ethereum browser extension detected. Please install MetaMask extensions";
      break ;
    case UnsupportedChainIdError:
      errorMsg = "You're trying to connect to an unsupported network";
      break ;
    case UserRejectedRequestError:
      errorMsg = "Please authorize this website to access your Ethereum account";
      break ;
    default:
      errorMsg = error?.message;
  }
  return errorMsg;
}