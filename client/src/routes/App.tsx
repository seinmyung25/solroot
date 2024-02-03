import DashBoard from "@/components/common/DashBoard/DashBoard"
import Playground from "@/components/common/Playground/Playground"
import { setSolRootContracts } from "@/lib/setContract"
import styles from '@/styles/Home.module.scss'
import { useEffect } from "react"

function App() {

  useEffect(() => {
    setSolRootContracts();
  }, [])
  
  return (
    <main className={styles.container}>
      <DashBoard />
      <div className={styles.inner}>
        <Playground />
      </div>
    </main>
  )
}

export default App
