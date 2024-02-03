import { WindowContext } from '@/context/window/context';
import { handleInputArray } from '@/lib/handleInput';
import { useContext } from 'react'
import styles from '@/components/common/Contract/List/ListElement.module.scss'

type Props = {
  contract: string;
  sequence: number;
  type: string;
}

const ListElement = ({ contract, sequence, type }: Props) => {
  const { inputs, setInputs } = useContext(WindowContext);

  return (
    <div 
      className={styles.container}
      onClick={() => {
        const _input = handleInputArray(inputs, contract, sequence, false);
        setInputs(_input)
      }}>
      <span className={styles.address}>{`${contract.slice(0, 35)}...`}</span>
      <span className={styles.type}>({type})</span>
    </div>
  )
}

export default ListElement