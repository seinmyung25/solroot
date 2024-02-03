import { useOnClickOutside } from "@/hooks/window/useOnclick";
import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "@/components/base/Dropdown/BaseDropdown.module.scss";

type Props = {
  title: string | undefined;
  children: ReactNode;
};

const BaseDropdown = ({ title, children }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const outSideRef = useRef<HTMLDivElement | null>(null);

  const handleIsOpen = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (outSideRef === null && isOpen === true) {
      setIsOpen(false);
    }
  }, []);

  useOnClickOutside({
    ref: outSideRef,
    handler: handleIsOpen,
    mouseEvent: "click",
  });

  return (
    <section className={styles.container}>
      <div
        ref={outSideRef}
        onClick={() => setIsOpen(true)}
        className={styles.header}
      >
        {title}
      </div>
      {isOpen && <div className={styles.body}>{children}</div>}
    </section>
  );
};

export default BaseDropdown;
