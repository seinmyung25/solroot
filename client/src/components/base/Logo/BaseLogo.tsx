import styles from '@/components/base/Logo/Logo.module.scss'

const BaseLogo = () => {
  return (
    <a href='/' className={styles.logo}>
      <img 
        src="/assets/solidity_logo.svg"
        alt="Home" 
        className={styles.image}
      />
      SolRoot
    </a>
  )
}

export default BaseLogo