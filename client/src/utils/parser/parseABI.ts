import { InstructionType } from "@/types/Instructions";

export const parseConstructor = (abi: string): InstructionType[] => {
  const _abi = JSON.parse(abi).abi[0];
  return [_abi];
};

export const parseFunction = (abi: string): InstructionType[] => {
  const _abi = JSON.parse(abi).abi.filter((el: InstructionType) => {
    return el.type === "function";
  });
  return _abi;
};

export const parseViewFunction = (abi: string): InstructionType[] => {
  const _abi = JSON.parse(abi).filter((el: InstructionType) => {
    return (
      el.type === "function" &&
      el.inputs.length === 0 &&
      el.outputs?.length !== 0
    );
  });

  return _abi;
};
