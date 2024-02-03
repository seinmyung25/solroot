export type InstructionType = {
  inputs: InstructionIOType[];
  name?: string;
  stateMutability: string;
  anonymous?: boolean;
  type: string;
  outputs?: InstructionIOType[];
}

export type InstructionIOType = {
  internalType: string;
  name: string;
  type: string;
  Indexed?: boolean;
}