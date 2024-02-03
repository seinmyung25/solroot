import { ethers } from "ethers";

export type Size = "small" | "regular" | "large";

export type Color = "primary-1" | "primary-2" | "primary-3" | "dark" | "light";

export type Func = {
  method: <T>(...params: T[]) => Promise<ethers.Transaction>;
};
