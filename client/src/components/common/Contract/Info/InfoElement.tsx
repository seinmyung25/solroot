import { ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "@/components/common/Contract/Info/InfoElement.module.scss";
import { FunctionFragment } from "ethers";

type Props = {
  instruction: any;
  contract: ethers.BaseContract;
  address: string;
};

const InfoElement = ({ instruction, contract, address }: Props) => {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (instruction.name) {
      const _getContractState = async() => {
      const contractMethod = contract.getFunction(instruction.name as string | FunctionFragment)
      const response = await contractMethod();
      if (typeof response === 'bigint') {
        const format = ethers.formatEther(response).toString();
        setText(format === '0.0' ? '0.0' : format);
      } else {
        if ((typeof response === 'string' || typeof response === 'number' || typeof response === 'boolean')) {
          setText(response.toString());
        } else { 
          if (typeof response === 'object') {
            const _value = {...response};
            setText(_value[2].toString());
          }
        }
      }
     }
      _getContractState();
    }
  }, [instruction, contract, address])


  return (
    <section className={styles.container}>
      <div className={styles.title}>
        {instruction.name}
        <span className={styles.type}>
          {instruction.outputs && instruction.outputs.length !== 0
            ? `(${instruction.outputs[0].type})`
            : ""}
        </span>
      </div>
      <div>{text}</div>
    </section>
  );
};

export default InfoElement;
