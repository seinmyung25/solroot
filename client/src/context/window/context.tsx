import { Dispatch, SetStateAction, createContext } from "react";

/**
 * @description Global State Managements Related Windows
 */
export interface windowContext {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  message: string | undefined;
  setMessage: Dispatch<SetStateAction<string | undefined>>;
  modalState: string | undefined;
  setModalState: Dispatch<SetStateAction<string | undefined>>;
  inputs: string[]
  setInputs: Dispatch<SetStateAction<string[]>>;
  popup: string | undefined;
  setPopup: Dispatch<SetStateAction<string | undefined>>;
}

const defaultValue: windowContext = {
  isLoading: false,
  setIsLoading: () => {},
  modalState: undefined,
  message: undefined,
  setMessage: () => {},
  setModalState: () => {},
  inputs: [],
  setInputs: () => {},
  popup: undefined,
  setPopup: () => {}
}

const WindowContext = createContext(defaultValue);

export {
  WindowContext,
}