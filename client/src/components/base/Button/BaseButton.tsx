import { BaseButtonProps } from "@/types/Button";
import classNames from "classnames/bind";
import styles from "@/components/base/Button/BaseButton.module.scss";

const cn = classNames.bind(styles);

const BaseButton = ({ title, color, size, onClick }: BaseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn("container", `container-${size}`, `container-${color}`)}
    >
      {title}
    </button>
  );
};

export default BaseButton;
