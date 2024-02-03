import { useWeb3React } from "@web3-react/core";
import { injected } from "@/utils/web3/connecter";
import { useEffect, useState, useCallback } from "react";
import { Ethereum } from "@/@types/ethereum";

// React Custom Hooks
export const useWeb3Connect = () => {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState<boolean>(false);

  const tryActivate = useCallback(() => {
    const _tryActivate = async () => {
      const isAuthorized = await injected.isAuthorized();
      if (isAuthorized) {
        try {
          await activate(injected, undefined, true);
        } catch (e) {
          console.log(e);
          return tried; // return false;
        }
      }
      setTried(true);
    };
    _tryActivate();
  }, [activate]); // dependencies array

  useEffect(() => {
    tryActivate();
  }, [tryActivate]); // dependencies array

  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]); // dependencies array

  return tried; // return true or false
};

export const useInactiveListener = (supress = false) => {
  const { activate, active, error } = useWeb3React();

  useEffect(() => {
    const ethereum = window.ethereum as Ethereum | undefined;

    if (ethereum && ethereum.on && !active && !error && !supress) {
      const handleConnect = () => {
        activate(injected);
      };

      const handleChainChanege = (chainId: number) => {
        activate(injected);
      };

      const handleAccountChange = (account: string) => {
        if (account.length !== 0) {
          activate(injected);
        }
      };

      ethereum.on("connect", handleConnect);
      ethereum.on("chainChange", handleChainChanege);
      ethereum.on("accountChange", handleAccountChange);

      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener("connect", handleConnect);
          ethereum.removeListener("chainChange", handleChainChanege);
          ethereum.removeListener("accountChange", handleAccountChange);
        }
      };
    }
  }, [activate, error, active, supress]);
};
