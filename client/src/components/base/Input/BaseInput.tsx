import { InputProps } from "@/types/Input";
import styles from "@/components/base/Input/BaseInput.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

const BaseInput = ({
  title,
  desc,
  inputType,
  subTitle,
  size,
  color,
  placeholder,
  value,
  onChange,
  onSubmit,
}: InputProps) => {
  return (
    <div className={cn("container", `container-${size}`)}>
      <input
        type={inputType}
        placeholder={placeholder}
        className={cn("inputBody", `inputBody-${color}`)}
        onChange={onChange}
        onKeyUp={onSubmit}
        value={value}
      />
      {title && <div className={cn("title", `title-${size}`)}>{title}</div>}
      {desc && <div className={cn("desc", `desc-${size}`)}>{desc}</div>}
      {subTitle && <div className={cn("subTitle")}>({subTitle})</div>}
    </div>
  );
};

export default BaseInput;
