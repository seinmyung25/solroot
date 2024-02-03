import Header from '@/layout/header/Header';
import Footer from '@/layout/footer/Footer';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  )
}

export default Layout