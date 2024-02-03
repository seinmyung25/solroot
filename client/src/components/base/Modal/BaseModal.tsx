import { ReactNode } from 'react'
import styles from '@/components/base/Modal/BaseModal.module.scss'

type Props = {
  children: ReactNode;
}

const BaseModal = ({ children }: Props) => {

  return (
    <section 
      className={styles.container}>
      <div className={styles.inner}>
        {children}
      </div>
    </section>
  )
}

export default BaseModal