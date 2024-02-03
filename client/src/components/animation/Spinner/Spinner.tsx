import styles from "@/components/animation/Spinner/Spinner.module.scss";
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

type Props = {
  type: "full" | "basic";
};

const Spinner = ({ type }: Props) => {
  return (
    <div className={cn("container", `container-${type}`)}>
      <div className={cn("loader")} />
    </div>
  );
};

export default Spinner;
