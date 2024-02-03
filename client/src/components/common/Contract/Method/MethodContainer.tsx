import MethodElement from "@/components/common/Contract/Method/MethodElement";
import BaseButton from "@/components/base/Button/BaseButton";
import { useContext, useEffect, useState } from "react";
import { WindowContext } from "@/context/window/context";
import IconButton from "@/components/base/Button/IconButton";
import { HiClipboard } from "react-icons/hi";
import { ethers } from "ethers";
import { handleCopy } from "@/lib/clipboard";
import { callContractMethod } from "@/lib/callContractMethod";
import styles from "@/components/common/Contract/Method/MethodContainer.module.scss";
import { getDeployedContract } from "@/lib/getContract";
import { InstructionType } from "@/types/Instructions";
import { BaseContract } from "ethers";
import { Fragment } from "ethers";

type Props = {
  address: string;
  name: string | undefined;
  method: Fragment | undefined;
  metadata: InstructionType | undefined;
  contract: string;
  signer: ethers.Signer | undefined;
};

const MethodContainer = ({
  address,
  name,
  method,
  contract,
  metadata,
  signer,
}: Props) => {
  const { inputs, setInputs, setPopup } = useContext(WindowContext);
  const [value, setValue] = useState<string | number | boolean | undefined>(
    undefined
  );

  const _contract: BaseContract = getDeployedContract(address, JSON.parse(contract).abi, signer);

  const handleTransaction = () => {
    const isDeploy = name?.includes("deploy") ? true : false;
    const _handleTx = async () => {
      await callContractMethod(
        inputs.length,
        inputs,
        _contract,
        method,
        setValue,
        isDeploy
      );
    };
    _handleTx();
  };

  return (
    <section className={styles.container}>
      <div className={styles.textContainer}>
        <div className={styles.title}>{name}</div>
        <div className={styles.address}>
          <div className={styles.clipboard}>
            <IconButton
              onClick={() => {
                if (address) {
                  handleCopy(address, setPopup);
                }
              }}
            >
              <HiClipboard color="#6C757D" size="18" />
            </IconButton>
          </div>
          {address}
        </div>
      </div>
      {method !== undefined && (
        <div className={styles.bodyContainer}>
          <MethodElement
            address={address}
            method={method}
          />
        </div>
      )}
      <div className={styles.btnContainer}>
        <div className={styles.btnInner}>
          <BaseButton
            title="Init"
            color="dark"
            size="regular"
            onClick={() => {
              if (inputs) {
                setInputs([]);
              }
            }}
          />
        </div>
        <div className={styles.btnInner}>
          <BaseButton
            title={`execute ${name}` || ""}
            color="dark"
            size="regular"
            onClick={() => {
              handleTransaction();
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default MethodContainer;
