export const searchContractName = () => {
  const names = Object.keys(localStorage).filter((keys: string) => {
    return keys.includes("solroot");
  });

  return names;
};

export const searchContractAddress = (names: string[]) => {
  let result: { name: string; address: string[] }[] = [];

  names.map((name: string) => {
    const address = localStorage[`${name}`].split("/");
    result.push({
      name: name,
      address: address.slice(0, address.length - 1),
    });
  });

  return result;
};
