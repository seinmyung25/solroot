import Spinner from '@/components/animation/Spinner/Spinner';
import { WindowContext } from '@/context/window/context';
import { useContext, useEffect } from 'react';
import styles from '@/components/base/Loading/Loading.module.scss'
import classNames from 'classnames/bind';

const cn = classNames.bind(styles);

type Props = {
  type: 'full' | 'basic'
}

const Loading = ({ type }: Props) => {
  const { message, setMessage } = useContext(WindowContext);

  useEffect(() => {
    return () => {
      setMessage(undefined);
    }
  }, [])

  return (
    <section className={cn(`container-${type}`)}>
      <Spinner type={type} />
      <div className={styles.msgContainer}>
        {message}
      </div>
    </section>
  )
}

export default Loading