import { useState, useEffect, useContext } from "react";
import styles from "@/components/base/Toggle/BaseToggle.module.scss";
import classNames from "classnames/bind";
import { TiArrowSortedDown } from "react-icons/ti";
import {
  _isNumber,
  getInitInputSet,
  handleInputArray,
} from "@/lib/handleInput";
import BaseInput from "@/components/base/Input/BaseInput";
import { InstructionType } from "@/types/Instructions";
import BaseButton from "@/components/base/Button/BaseButton";
import { ethers } from "ethers";
import { WindowContext } from "@/context/window/context";

const cn = classNames.bind(styles);

type Props = {
  abi: string;
  instruction: InstructionType[];
};

const BaseToggle = ({ abi, instruction }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputs, setInputs] = useState<string[]>([]);
  const {setInputs: setInput} = useContext(WindowContext)

  useEffect(() => {
    if (inputs === null || inputs.length === 0) {
      setInputs(getInitInputSet(instruction[0].inputs.length));
    }

    return () => {
      setInputs([]);
    };
  }, []);

  const handleEncode = () => {
    const iface = new ethers.Interface(abi);
    const res = iface.encodeFunctionData("initSolRootChild", [...inputs]);
    setInput([res])
  };

  return (
    <section className={cn("container")}>
      <div className={cn("header")} onClick={() => setIsOpen(!isOpen)}>
        <div className={cn("icon", `icon-${isOpen ? "open" : "close"}`)}>
          <TiArrowSortedDown size="30" color="#333" />
        </div>
      </div>
      {isOpen && inputs && (
        <div className={cn("body")}>
          {instruction[0].inputs?.map((el, idx) => {
            const _number = _isNumber(el.type);
            return (
              <div key={idx} className={cn("inputsContainer")}>
                <BaseInput
                  title={el.name}
                  inputType="text"
                  subTitle={el.type}
                  size="regular"
                  color="dark"
                  placeholder={`${el.name}을 입력해주세요`}
                  value={inputs[idx] || ""}
                  onChange={(event) => {
                    const target = event.target.value;
                    const values = handleInputArray(
                      inputs,
                      target,
                      idx,
                      _number
                    );
                    setInputs(values);
                  }}
                  onSubmit={() => {}}
                />
              </div>
            );
          })}
          <BaseButton
            title={instruction[0].name || ""}
            color={"dark"}
            size="small"
            onClick={() => {
              handleEncode();
            }}
          />
        </div>
      )}
    </section>
  );
};

export default BaseToggle;
