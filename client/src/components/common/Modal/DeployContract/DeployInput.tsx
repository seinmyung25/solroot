import BaseInput from "@/components/base/Input/BaseInput";
import { WindowContext } from "@/context/window/context";
import { getInitInputSet, handleInputArray } from "@/lib/handleInput";
import { InstructionIOType, InstructionType } from "@/types/Instructions";
import { useContext, useEffect, useRef, useState } from "react";
import { _isNumber } from "@/lib/handleInput";
import ListContainer from "@/components/common/Contract/List/ListContainer";
import styles from "@/components/common/Contract/Method/MethodElement.module.scss";
import { searchContractName } from "@/lib/getDeployedContract";

type DeployInputListProps = {
  address: string;
  metadata: InstructionType[] | undefined;
};

const DeployInputList = ({ metadata, address }: DeployInputListProps) => {
  return (
    <section className={styles.container}>
      {metadata?.map((el: InstructionType, idx: number) => {
        return <DeployInput key={idx} address={address} instruction={el} />;
      })}
    </section>
  );
};

type DeployInputProps = {
  address: string;
  instruction: InstructionType;
};

export const DeployInput = ({ instruction, address }: DeployInputProps) => {
  const { inputs, setInputs } = useContext(WindowContext);
  const [isOpen, setIsOpen] = useState<number | undefined>(undefined);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (inputs === undefined || inputs.length === 0) {
      setInputs(getInitInputSet(instruction.inputs.length));
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
      {instruction.inputs.map((el: InstructionIOType, idx: number) => {
        const _number = _isNumber(el.type);

        return (
          <div key={idx} ref={bodyRef} className={styles.inputBodyContainer}>
            <div
              onClick={() => {
                handleIsOpen(idx, el.internalType, inputs[idx]);
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
                  handleIsOpen(idx, el.internalType, inputs[idx]);
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
    </section>
  );
};

export default DeployInputList;