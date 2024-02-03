import BaseInput from "@/components/base/Input/BaseInput";
import { WindowContext } from "@/context/window/context";
import { handleInputArray } from "@/lib/handleInput";
import { useContext, useEffect, useRef, useState } from "react";
import { _isNumber } from "@/lib/handleInput";
import ListContainer from "@/components/common/Contract/List/ListContainer";
import styles from "@/components/common/Contract/Method/MethodElement.module.scss";
import { searchContractName } from "@/lib/getDeployedContract";
import { ethers } from "ethers";
import { ContractContext } from "@/context/contract/context";
import { getABIMethodInputParams, getImpleContract, getImpleContractParams } from "@/lib/getContract";
import BaseToggle from "@/components/base/Toggle/BaseToggle";

type MethodElementProps = {
  address: string;
  method: ethers.Fragment | undefined;
};

const MethodElement = ({ address, method }: MethodElementProps) => {
  return (
    <section className={styles.container}>
      <ComponentsByInstructions address={address} instruction={method} />
    </section>
  );
};

type ComponentsByInstructionsProps = {
  address: string;
  instruction: any;
};

export const ComponentsByInstructions = ({
  instruction,
  address,
}: ComponentsByInstructionsProps) => {
  const { inputs, setInputs } = useContext(WindowContext);
  const [isOpen, setIsOpen] = useState<number | undefined>(undefined);
  const {
    contractABI,
    signer,
    impleABI,
    impleAddress,
    setImpleABI,
    setImpleAddress,
  } = useContext(ContractContext);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const getImple = async () => {
      const impleAddr = await getImpleContract(address, contractABI, signer);
      const impleAbi = await getImpleContractParams(
        address,
        contractABI,
        signer
      );
      setImpleABI(JSON.stringify(impleAbi?.abi));
      setImpleAddress(impleAddr);
    };
    if (instruction.name === "deploy" &&
        instruction.inputs[0].name === "initData" &&
        instruction.inputs[0].baseType === "bytes") {
          getImple();
        }
    return () => {
      setInputs([]);
    };
  }, []);

  const handleIsOpen = (idx: number, type: string, content: string) => {
    if (
      type === "address" &&
      (content === undefined || content.length === 0) &&
      idx !== isOpen
    ) {
      setIsOpen(idx);
    } else {
      setIsOpen(undefined);
    }
  };
  return (
    <section className={styles.inputContainer}>
      {instruction?.inputs.map((el: ethers.ParamType, idx: number) => {
        const _number = _isNumber(el.type);
        return (
          <div key={idx} ref={bodyRef} className={styles.inputBodyContainer}>
            <div
              onClick={() => {
                handleIsOpen(idx, el.baseType, inputs[idx]);
              }}
              ref={bodyRef}
              className={styles.inputBodyInner}
            >
              <BaseInput
                title={el.name}
                inputType="text"
                color="dark"
                size="large"
                subTitle={el.type}
                placeholder={`${el.name}을 입력해주세요`}
                onChange={(event) => {
                  handleIsOpen(idx, el.baseType, inputs[idx]);
                  const target = event.target.value;
                  const _inputs = handleInputArray(
                    inputs,
                    target,
                    idx,
                    _number
                  );
                  setInputs(_inputs);
                }}
                onSubmit={() => {
                  setIsOpen(undefined);
                }}
                value={inputs[idx] || ""}
              />
            </div>
            {isOpen === idx && (
              <ListContainer
                sequence={idx}
                setIsOpen={setIsOpen}
                contractName={searchContractName()}
              />
            )}
          </div>
        );
      })}
      {instruction.name === "deploy" &&
        instruction.inputs[0].name === "initData" &&
        instruction.inputs[0].baseType === "bytes" &&
        impleABI &&
        impleAddress && (
          <BaseToggle
            abi={impleABI}
            instruction={getABIMethodInputParams(
              impleABI,
              "initSolRootChild"
            )}
          />
        )}
    </section>
  );
};
export default MethodElement;