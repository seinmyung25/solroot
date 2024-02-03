import { useContext, useEffect, useState } from "react";
import { getContractByName, getDeployedContract } from "@/lib/getContract";
import { parseFunction } from "@/utils/parser/parseABI";
import MethodContainer from "@/components/common/Contract/Method/MethodContainer";
import InfoContainer from "@/components/common/Contract/Info/InfoContainer";
import { ethers } from "ethers";
import { WindowContext } from "@/context/window/context";
import styles from "@/components/common/Contract/ContractContainer.module.scss";
import classNames from "classnames/bind";
import { getContractFunctionList } from "@/lib/createContractUtils";
import { InstructionType } from "@/types/Instructions";
import { ContractContext } from "@/context/contract/context";
import { Fragment } from "ethers";

const cn = classNames.bind(styles);

type Props = {
  address: string;
  contract: string;
  signer: ethers.Signer | undefined;
};

const ContractContainer = ({ address, contract, signer }: Props) => {
  const { setInputs } = useContext(WindowContext);
  const { setContractABI, setSigner } = useContext(ContractContext);
  const [name, setName] = useState<string | undefined>(undefined);
  const [state, setState] = useState<boolean>(false);
  const [current, setCurrent] = useState<Fragment | undefined>(undefined);
  const [metadata, setMetadata] = useState<InstructionType | undefined>(
    undefined
  );

  useEffect(() => {
    setName(undefined);
    setCurrent(undefined);
    setState(false);
  }, [address]);

  const instructions = getContractByName(contract);
  const _instructions = parseFunction(JSON.stringify(instructions));
  const _contract = getDeployedContract(
    address,
    JSON.stringify(instructions?.abi),
    signer
  );

  const methodArray = getContractFunctionList(_contract, [
    'all'
  ]);

  useEffect(() => {
    setContractABI(JSON.stringify(instructions?.abi));
    setSigner(signer);
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.toggleContainer}>
        <div
          onClick={() => setState(false)}
          className={cn("toggleBtn", state || "toggleBtn-active")}
        >
          INFO
        </div>
        <div
          onClick={() => setState(true)}
          className={cn("toggleBtn", state && "toggleBtn-active")}
        >
          METHOD
        </div>
      </div>
      <nav className={styles.navContainer}>
        {methodArray.map((el: any, idx: number) => {
          const name = el.name;
          return (
            <div
              key={idx}
              onClick={() => {
                setInputs([]);
                setState(true);
                setName(name);
                setCurrent(el);
                setMetadata(undefined);
              }}
              className={styles.btnContainer}
            >
              {name}
            </div>
          );
        })}
      </nav>
      {state ? (
        <MethodContainer
          address={address}
          name={name || _instructions[0].name}
          contract={JSON.stringify(instructions)}
          method={current}
          metadata={metadata}
          signer={signer}
        />
      ) : (
        <InfoContainer
          address={address}
          contract={JSON.stringify(instructions?.abi)}
          signer={signer}
        />
      )}
    </section>
  );
};

export default ContractContainer;
