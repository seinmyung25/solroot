import BaseButton from '@/components/base/Button/BaseButton'
import { getErrorMsg } from '@/utils/error/getErrorUtils';
import { WindowContext } from '@/context/window/context';
import { useInactiveListener, useWeb3Connect } from '@/hooks/web3/useWeb3Connect';
import { injected } from '@/utils/web3/connecter';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useContext } from 'react';

const Activate = () => {
  const context = useWeb3React();
  const { deactivate, activate, active } = context;
  const { setIsLoading } = useContext(WindowContext);

  const handleActivate = useCallback(() => {
    const _activate = async() => {
      setIsLoading(true);
      await activate(injected)
      setIsLoading(false);
    }
    _activate();
  }, [active])

  const handleDisactivate = useCallback(() => {
    setIsLoading(true);
    deactivate();
    setIsLoading(false);
  }, [active])

  const eagerConnectSuccessful = useWeb3Connect();
  useInactiveListener(!eagerConnectSuccessful);

  return (
    <BaseButton
      title={active ? 'Disconnect' : 'Connect'}
      color='primary-3'
      size='regular'
      onClick={() => {active ? handleDisactivate() : handleActivate()}}
    /> 
  )
}

const Connect = () => {
  const { error } = useWeb3React();

  if (error) {
    window.alert(getErrorMsg(error));
  }

  return (
    <>
      <Activate />
    </>
  )
}

export default Connect;