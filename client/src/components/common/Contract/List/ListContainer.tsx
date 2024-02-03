import ListElement from "@/components/common/Contract/List/ListElement";
import { Dispatch, SetStateAction } from "react";
import { useWeb3React } from "@web3-react/core";
import styles from "@/components/common/Contract/List/ListContainer.module.scss";
import { searchContractAddress } from "@/lib/getDeployedContract";

type Props = {
  sequence: number;
  setIsOpen: Dispatch<SetStateAction<number | undefined>>;
  contractName: string[];
};

const ListContainer = ({ sequence, setIsOpen, contractName }: Props) => {
  const contracts = searchContractAddress(contractName);
  const { account } = useWeb3React();

  return (
    <section
      onClick={() => {
        setIsOpen(undefined);
      }}
      className={styles.container}
    >
      <ListElement
        contract={account || ""}
        type="CURRENT"
        sequence={sequence}
      />
      {contracts.map((contract) => {
        return contract.address.map((el: string, idx: number) => {
          return (
            <ListElement
              key={idx}
              contract={el}
              type={contract.name.slice(8)}
              sequence={sequence}
            />
          );
        });
      })}
    </section>
  );
};

export default ListContainer;
