import 'styles/globals.scss'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { WalletProvider } from 'providers/wallet'
import { TradeProvider } from 'providers/trade'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <TradeProvider>
        <Head>
          <title>TDEX - NextJS Edition</title>
          <meta
            content="TDEX reference implementation in NextJS"
            name="description"
          />
          <meta content="TDEX - NextJS Edition" property="og:title" />
          <meta
            content="TDEX reference implementation in NextJS"
            property="og:description"
          />
          <meta content="/images/og/card1200.png" property="og:image" />
          <meta content="TDEX - NextJS Edition" property="twitter:title" />
          <meta
            content="TDEX reference implementation in NextJS"
            property="twitter:description"
          />
          <meta content="/images/og/card1200.png" property="twitter:image" />
          <meta property="og:type" content="website" />
          <meta content="summary_large_image" name="twitter:card" />
          <link rel="icon" href="/favicon.png" />
        </Head>
        <Component {...pageProps} />
      </TradeProvider>
    </WalletProvider>
  )
}

export default MyApp
