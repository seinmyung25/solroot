import BaseLogo from '@/components/base/Logo/BaseLogo'
import styles from '@/layout/header/Header.module.scss'
import Connect from '@/components/common/Buttons/ConnectButton'

const Header = () => {
  return (
    <header className={styles.container}>
      <div className={styles.inner}>
        <BaseLogo />
        <div className={styles.btnContainer}>
          <Connect />
        </div>
      </div>
    </header>
  )
}

export default Header