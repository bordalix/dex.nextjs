import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { WalletContext } from './wallet'
import { TDEXMarket, isTDEXMarket } from 'lib/types'
import {
  fetchMarketsFromProvider,
  fetchMarketBalance,
  getMarketPrice,
} from 'lib/tdex/market'
import { getProvidersFromRegistry } from 'lib/tdex/registry'

interface TradeContextProps {
  loading: boolean
  markets: TDEXMarket[]
}

export const TradeContext = createContext<TradeContextProps>({
  loading: false,
  markets: [],
})

interface TradeProviderProps {
  children: ReactNode
}

export const TradeProvider = ({ children }: TradeProviderProps) => {
  const { network } = useContext(WalletContext)

  const [loading, setLoading] = useState(false)
  const [markets, setMarkets] = useState<TDEXMarket[]>([])

  // fetch and set markets (needs to fetch providers)
  useEffect(() => {
    const asyncFetchAndSetMarkets = async () => {
      setLoading(true)
      const markets: TDEXMarket[] = []
      for (const provider of await getProvidersFromRegistry(network)) {
        for (let market of await fetchMarketsFromProvider(provider)) {
          markets.push({
            ...market,
            balance: await fetchMarketBalance(market),
            price: await getMarketPrice(market),
          })
        }
      }
      setMarkets(markets.filter(isTDEXMarket))
      setLoading(false)
    }
    asyncFetchAndSetMarkets()
  }, [network])

  return (
    <TradeContext.Provider value={{ loading, markets }}>
      {children}
    </TradeContext.Provider>
  )
}
