import { Dispatch, SetStateAction } from "react";

export const handleCopy = (
  text: string,
  callback: Dispatch<SetStateAction<string | undefined>>
) => {
  callback('Successfully Copied!');
  window.navigator.clipboard.writeText(text)
  setTimeout(() => {
    callback(undefined);
  }, 1200)
}