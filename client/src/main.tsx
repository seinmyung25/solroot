import React from 'react'
import '@/styles/globals.scss'
import ReactDOM from 'react-dom/client'
import App from '@/routes/App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Web3ReactProvider } from '@web3-react/core';
import { getProvider } from '@/utils/web3/provider';
import Layout from '@/layout/Layout'
import MainContext from '@/context'

const router = createBrowserRouter([ // 아래와 같은 방식으로 Router 추가
    {
        path: "/",
        element: <App />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <Web3ReactProvider getLibrary={getProvider}>
      <MainContext>
        <Layout>
          <RouterProvider router={router} />
        </Layout>
      </MainContext>
    </Web3ReactProvider>
  </React.StrictMode>,
)
