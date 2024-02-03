import IconButton from "@/components/base/Button/IconButton";
import { getDeployedContract } from "@/lib/getContract";
import { ethers } from "ethers";
import { HiClipboard } from "react-icons/hi";
import InfoElement from "./InfoElement";
import { useContext, useState } from "react";
import { WindowContext } from "@/context/window/context";
import { handleCopy } from "@/lib/clipboard";
import { IoMdRefresh } from "react-icons/io";
import Spinner from "@/components/animation/Spinner/Spinner";
import styles from "@/components/common/Contract/Info/InfoContainer.module.scss";
import { getContractFunctionList } from "@/lib/createContractUtils";

type Props = {
  address: string;
  contract: string;
  signer: ethers.Signer | undefined;
};

const InfoContainer = ({ address, contract, signer }: Props) => {
  const { setPopup } = useContext(WindowContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const _contract = getDeployedContract(address, contract, signer);

  const viewMethod = getContractFunctionList(_contract, [
    'view'
  ])

  return (
    <section className={styles.container}>
      <div className={styles.textContainer}>
        <div className={styles.title}>Contract Information</div>
        <div className={styles.address}>
          <div className={styles.clipboard}>
            <IconButton
              onClick={() => {
                if (address) {
                  handleCopy(address, setPopup);
                }
              }}
            >
              <HiClipboard color="#6C757D" size="18" />
            </IconButton>
          </div>
          {address}
        </div>
      </div>
      <div className={styles.bodyContainer}>
        {viewMethod.map((el: ethers.Fragment, idx: number) => {
          return (
            <InfoElement
              key={idx}
              instruction={el}
              contract={_contract}
              address={address}
            />
          );
        })}
      </div>
      <div className={styles.btnContainer}>
        <IconButton
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
            }, 700);
          }}
        >
          <IoMdRefresh size="25" />
        </IconButton>
      </div>
      {isLoading && (
        <div className={styles.loading}>
          <Spinner type="full" />
        </div>
      )}
    </section>
  );
};

export default InfoContainer;
