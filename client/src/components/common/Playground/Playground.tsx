import BaseButton from "@/components/base/Button/BaseButton";
import { useContext, useEffect, useState } from "react";
import { WindowContext } from "@/context/window/context";
import DeployModal from "@/components/common/Modal/DeployContract/DeployModal";
import { useWeb3React } from "@web3-react/core";
import { isValidAccount } from "@/utils/valid/isValidAccount";
import { ethers } from "ethers";
import ContractContainer from "@/components/common/Contract/ContractContainer";
import SwitchContract from "@/components/common/Contract/Switch/SwitchContract";
import styles from "@/components/common/Playground/Playground.module.scss";
import { getSolRootContracts } from "@/lib/setContract";
import { searchContractName } from "@/lib/getDeployedContract";

const Playground = () => {
  const [name, setName] = useState<string | undefined>(undefined);
  const [contract, setContract] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const { modalState, setModalState, setInputs } = useContext(WindowContext);
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const { account, active, library } = useWeb3React();
  const solrootContract = getSolRootContracts();

  useEffect(() => {
    if (!library || !active || !isValidAccount(account)) {
      setSigner(undefined);
      return;
    }

    library.getSigner();
    setSigner(library.getSigner(account));
  }, [library]);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contract</h1>
        <SwitchContract
          address={address}
          setAddress={setAddress}
          setContract={setContract}
          contractNames={searchContractName()}
        />
      </div>
      <div className={styles.contentContainer}>
        {solrootContract?.map((el: string, idx: number) => {
          const _contract = el.toUpperCase();
          return (
            <div key={idx} className={styles.btnContainer}>
              <BaseButton
                title={_contract}
                color="primary-2"
                size="regular"
                onClick={() => {
                  setAddress(undefined);
                  setName(_contract);
                  setInputs([]);
                  setModalState(_contract);
                  setContract(undefined);
                }}
              />
            </div>
          );
        })}
      </div>
      {(contract === undefined || address === undefined) && (
        <article className={styles.undefinedMsg}>
          배포할 컨트랙트를 선택해주세요
        </article>
      )}
      {contract && address && (
        <ContractContainer
          address={address}
          contract={contract}
          signer={signer}
        />
      )}
      {modalState !== undefined && (
        <DeployModal
          name={name}
          address={address}
          signer={signer}
          setAddress={setAddress}
          setContract={setContract}
        />
      )}
    </section>
  );
};

export default Playground;
