import { ReactNode } from 'react'
import { WindowProvider } from '@/context/window/provider';
import { ContractProvider } from '@/context/contract/provider';

type Providers = (({children}: {children:ReactNode}) => JSX.Element)[];

export function ContextProvider(...Providers: Providers) {
  const MainContextProvider = ({ children }: { children: ReactNode}) => {
    let combine = children;
    
    Providers.map((Prov, idx: number) => {
      combine = <Prov key={idx}>{combine}</Prov>;
    });
    
    return combine;
  };

  return ({ children }: { children: ReactNode}) => (
    <MainContextProvider>{children}</MainContextProvider>
  );
};

const MainContext = ContextProvider(WindowProvider, ContractProvider);

export default MainContext;