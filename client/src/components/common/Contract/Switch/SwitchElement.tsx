import { WindowContext } from '@/context/window/context';
import { handleCopy } from '@/lib/clipboard';
import { useContext } from 'react'
import { HiClipboard } from 'react-icons/hi';
import styles from '@/components/common/Contract/Switch/SwitchElement.module.scss'

type Props = {
  el: string;
  name: string;
  switchContract: (_address: string, name: string) => void;
}

const SwitchElement = ({ el, name, switchContract }: Props) => {
  const { setPopup } = useContext(WindowContext);

  return (
    <div className={styles.elementContainer}>
      <div 
        onClick={() => {
          switchContract(el, name)
        }}
        className={styles.element}>
        <span className={styles.address}>
          {`${el.slice(0, 5)}...${el.slice(el.length-5, el.length)}`}
        </span>
        <span className={styles.type}>({name})</span>
      </div>
      <div
        className={styles.clipboard}
        onClick={() => {
          handleCopy(el, setPopup)
        }}
      >
        <HiClipboard
          color='#6C757D'
          size='20'
        />
      </div>
    </div> 
  )
}

export default SwitchElement