export const setDeployedContract = (
  address: string | undefined,
  name: string | undefined
) => {
  if (address === undefined || name === undefined) {
    return;
  }
  const current = localStorage.getItem(`solroot_${name}`);

  if (current) {
    localStorage.setItem(`solroot_${name}`, `${current}${address}/`);
  } else {
    localStorage.setItem(`solroot_${name}`, `${address}/`);
  }
};
