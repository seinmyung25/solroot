import { WindowContext } from "@/context/window/context";
import { Dispatch, SetStateAction, useContext } from "react";
import { ethers } from "ethers";
import { deployContract } from "@/lib/deployContract";
import BaseModal from "@/components/base/Modal/BaseModal";
import IconButton from "@/components/base/Button/IconButton";
import { RxCross2 } from "react-icons/rx";
import { parseConstructor } from "@/utils/parser/parseABI";
import BaseButton from "@/components/base/Button/BaseButton";
import { getContractByName } from "@/lib/getContract";
import styles from "@/components/common/Modal/DeployContract/DeployModal.module.scss";
import DeployInputList from '@/components/common/Modal/DeployContract/DeployInput'

export type ContractModalProps = {
  name: string | undefined;
  address: string | undefined;
  signer: ethers.Signer | undefined;
  setAddress: Dispatch<SetStateAction<string | undefined>>;
  setContract: Dispatch<SetStateAction<string | undefined>>;
};

const DeployModal = ({
  name,
  address,
  signer,
  setAddress,
  setContract,
}: ContractModalProps) => {
  const { inputs, setModalState, setIsLoading } = useContext(WindowContext);

  const _contract = getContractByName(name);
  const contract = _contract ? JSON.stringify(_contract) : "";
  const handleDeployContract = async () => {
    if (contract === undefined) return;
    setIsLoading(true);

    await deployContract({
      contract: contract,
      signer: signer,
      params: inputs,
      callback: setAddress,
      name: name,
    });

    setTimeout(() => {
      setContract(name);
      setIsLoading(false);
      setModalState(undefined);
    }, 1500);
  };

  return (
    <BaseModal>
      <div className={styles.header}>
        <div className={styles.modalTitle}>Deploy {name}</div>
        <IconButton
          onClick={() => {
            setModalState(undefined);
          }}
        >
          <RxCross2 size="25" />
        </IconButton>
      </div>
      <div className={styles.body}>
        <DeployInputList
          address={address || ""}
          metadata={parseConstructor(contract)}
        />
        {address ? (
          <div className={styles.message}>
            <span className={styles.text}>
              Your Contract Successfully Deployed at
            </span>
            <span className={styles.address}>{address || ""}</span>
          </div>
        ) : null}
        <div className={styles.btnContainer}>
          <BaseButton
            title={"Deploy"}
            color="primary-1"
            size="large"
            onClick={handleDeployContract}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default DeployModal;