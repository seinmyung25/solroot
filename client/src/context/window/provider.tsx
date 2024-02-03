import { ReactNode, useState } from 'react'
import { WindowContext } from '@/context/window/context';

const WindowProvider = ({ children }: { children: ReactNode}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalState, setModalState] = useState<string | undefined>(undefined);
  const [inputs, setInputs] = useState<string[]>([]);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [popup, setPopup] = useState<string | undefined>(undefined);

  const contextValue = {
    isLoading,
    setIsLoading,
    modalState, 
    setModalState,
    inputs,
    setInputs,
    message,
    setMessage,
    popup,
    setPopup
  }

  return (
    <>
      <WindowContext.Provider value={contextValue}>
        {children}
      </WindowContext.Provider>
    </>
  )
}

export {
  WindowProvider
}