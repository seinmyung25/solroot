import { WindowContext } from "@/context/window/context";
import { useContext } from "react";

type Props = {
  title: string;
}

const styles = {
  container: 'fixed w-screen h-screen bg-black/10 top-0 left-0 z-50',
  inner: 'absolute bg-white flex items-center justify-center w-80 px-4 h-12 top-10 left-1/2 -translate-x-1/2 shadow-md border-2 border-[#888] font-semibold rounded-xl'
}

const BasePopup = ({ title }: Props) => {
  const { popup } = useContext(WindowContext);

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        {popup}
      </div>
    </section>
  )
}

export default BasePopup