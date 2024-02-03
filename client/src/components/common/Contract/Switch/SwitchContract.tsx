import BaseDropdown from "@/components/base/Dropdown/BaseDropdown";
import { WindowContext } from "@/context/window/context";
import { Dispatch, SetStateAction, useContext } from "react";
import SwitchElement from "./SwitchElement";
import styles from "@/components/common/Contract/Switch/SwitchContainer.module.scss";
import { searchContractAddress } from "@/lib/getDeployedContract";

type Props = {
  address: string | undefined;
  setAddress: Dispatch<SetStateAction<string | undefined>>;
  setContract: Dispatch<SetStateAction<string | undefined>>;
  contractNames: string[];
};

const SwitchContract = ({
  address,
  setAddress,
  setContract,
  contractNames,
}: Props) => {
  const contracts = searchContractAddress(contractNames);

  const { setMessage, setIsLoading } = useContext(WindowContext);

  const handleSwitchingContract = (_address: string, contract: string) => {
    setMessage("Switching Contract");
    setIsLoading(true);

    setTimeout(() => {
      setAddress(_address);
      setContract(contract);
      setMessage(undefined);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <BaseDropdown
      title={`${address ? address?.slice(0, 10) : "Not Selected"}...`}
    >
      {(contracts === undefined || contracts.length === 0) ? (
        <div className={styles.container}>
          <div className={styles.element}>Nothing Deployed...</div>
        </div>
      ) : (
        <div className={styles.container}>
          {/**
            현재 로드된 Contract 변경 메소드
           */}
          {contracts.map((contract) => {
            return contract.address.map((el: string, idx: number) => {
              return (
                <SwitchElement
                  key={idx}
                  el={el}
                  name={contract.name.slice(8)}
                  switchContract={handleSwitchingContract}
                />
              );
            });
          })}
        </div>
      )}
    </BaseDropdown>
  );
};

export default SwitchContract;
