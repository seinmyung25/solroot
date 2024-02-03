export const setSolRootContracts = (contract?: string | undefined) => {
  const current = localStorage.getItem("contracts");
  const base = "ERC20/Parent";

  if (current !== undefined && contract !== undefined) {
    localStorage.setItem("contracts", `${current}/${contract}`);
  } else if (current === undefined && contract === undefined) {
    localStorage.setItem("contracts", base);
  } else if (current === undefined && contract !== undefined) {
    localStorage.setItem("contract", `${base}/${contract}`);
  } else {
    localStorage.setItem("contracts", base);
  }
};

export const getSolRootContracts = () => {
  const current = localStorage.getItem("contracts");

  return current?.split("/");
};
