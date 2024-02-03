import { IconButtonProps } from "@/types/Button"
import styles from '@/components/base/Button/IconButton.module.scss'

const IconButton = ({ onClick, children }: IconButtonProps) => {

  return (
    <button
      onClick={onClick} 
      className={styles.container}>
      {children}
    </button>
  )
}

export default IconButton