export const isValidAccount = (account: string | undefined | null) => {
  if (account === undefined 
    || account === null 
    || typeof account === 'undefined'
    || account.length === 0)
      return false;
  return true;
}