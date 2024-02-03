import { useWeb3React } from "@web3-react/core";
import { getChainNameById } from "@/lib/getChainNameById";
import InfoBlock from "@/components/base/InfoBlock/InfoBlock";
import { useContext, useEffect, useState } from "react";
import { isValidAccount } from "@/utils/valid/isValidAccount";
import { ethers } from "ethers";
import IconButton from "@/components/base/Button/IconButton";
import { HiClipboard } from "react-icons/hi";
import { handleCopy } from "@/lib/clipboard";
import { WindowContext } from "@/context/window/context";
import styles from "@/components/common/DashBoard/DashBoard.module.scss";
import classNames from "classnames/bind";
import Loading from "@/components/base/Loading/Loading";
import { BigNumberish } from "ethers";

type Props = {
  isLoading: boolean;
};

const cn = classNames.bind(styles);

const ChainId = ({ isLoading }: Props) => {
  const { chainId } = useWeb3React();

  return (
    <InfoBlock
      title="CURRENT CHAIN ID: "
      isLoading={isLoading}
      isAccount={false}
      content={chainId?.toString() || "Chain ID를 가져올 수 없습니다"}
      subContent={getChainNameById(chainId)}
    />
  );
};

const BlockNumber = ({ isLoading }: Props) => {
  const { chainId, library, active } = useWeb3React();
  const [blockNumber, setBlockNumber] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!library || !active) return;

    /**
     * @description activate when NextNone Components does not mount
     */
    let state = false;
    const getBlockNumber = async () => {
      try {
        if (!state) {
          const _blockNumber = await library.getBlockNumber();
          setBlockNumber(_blockNumber);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getBlockNumber();

    library.on("block", getBlockNumber);

    return () => {
      state = true;
      library.removeListener("block", getBlockNumber);
      setBlockNumber(undefined);
    };
  }, [library, chainId]); // dependencies array

  return (
    <InfoBlock
      title="BLOCK NUMBER: "
      isAccount={false}
      isLoading={isLoading}
      content={blockNumber || "Block Number를 가져올 수 없습니다"}
    />
  );
};

const Account = ({ isLoading }: Props) => {
  const { account } = useWeb3React();
  const { setPopup } = useContext(WindowContext);

  return (
    <InfoBlock
      title="ACCOUNT: "
      isAccount={true}
      isLoading={isLoading}
      content={account || "ACCOUNT 가져올 수 없습니다"}
    >
      {account && (
        <div className={styles.buttonContainer}>
          <IconButton
            onClick={() => {
              if (account) {
                handleCopy(account, setPopup);
              }
            }}
          >
            <HiClipboard size="20" color="#6C757D" />
          </IconButton>
        </div>
      )}
    </InfoBlock>
  );
};

const Balanace = ({ isLoading }: Props) => {
  const { account, library, chainId, active } = useWeb3React();
  const [balance, setBalance] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!library || !active || !isValidAccount(account)) return;

    /**
     * @description activate when NextNone Components does not mount
     */
    let state = false;
    const getBalance = async () => {
      try {
        if (!state) {
          const _balance: BigNumberish = await library.getBalance(account);
          const formatted = ethers.formatEther(BigInt(_balance));
          setBalance(parseFloat(formatted));
        }
      } catch (e) {
        console.log(e);
      }
    };
    getBalance();

    library.on("block", getBalance);

    return () => {
      state = true;
      library.removeListener("block", getBalance);
      setBalance(undefined);
    };
  }, [library, chainId]); // dependencies array

  return (
    <InfoBlock
      title="BALANCE: "
      isAccount={false}
      isLoading={isLoading}
      content={
        balance ? balance.toString() + " ETH" : "Balance를 가져올 수 없습니다"
      }
    />
  );
};

const NextNonce = ({ isLoading }: Props) => {
  const { account, library, chainId, active } = useWeb3React();
  const [nextNonce, setNextNonce] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!library || !active || !isValidAccount(account)) return;

    /**
     * @description activate when NextNone Components does not mount
     */
    let state = false;
    const getNextNone = async () => {
      try {
        if (!state) {
          const _nextNonce = await library.getTransactionCount(account);
          setNextNonce(_nextNonce);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getNextNone();

    library.on("block", getNextNone);

    return () => {
      state = true;
      library.removeListener("block", getNextNone);
      setNextNonce(undefined);
    };
  }, [library, chainId]); // dependencies array
  return (
    <InfoBlock
      title="Next Nonce: "
      isAccount={false}
      isLoading={isLoading}
      content={nextNonce || "Next Nonce를 가져올 수 없습니다"}
    />
  );
};

const DashBoard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);
  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <Loading type="basic" />
          </div>
        )}
        <div className={cn("inner-left")}>
          <ChainId isLoading={isLoading} />
          <BlockNumber isLoading={isLoading} />
          <NextNonce isLoading={isLoading} />
        </div>
        <div className={cn("inner-right")}>
          <Account isLoading={isLoading} />
          <Balanace isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
};

export default DashBoard;
