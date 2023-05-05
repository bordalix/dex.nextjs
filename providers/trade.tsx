import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { WalletContext } from './wallet'
import { TDEXMarket, isTDEXMarket } from 'lib/types'
import { fetchMarketsFromProvider, getMarketPrice } from 'lib/tdex/market'
import { getProvidersFromRegistry } from 'lib/tdex/registry'
import { showToast } from 'lib/toast'

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
      try {
        setLoading(true)
        const markets: TDEXMarket[] = []
        for (const provider of await getProvidersFromRegistry(network)) {
          for (let market of await fetchMarketsFromProvider(provider)) {
            markets.push({
              ...market,
              price: await getMarketPrice(market),
            })
          }
        }
        setMarkets(markets.filter(isTDEXMarket))
        setLoading(false)
      } catch (err) {
        console.error(err)
        showToast(err)
      }
    }
    asyncFetchAndSetMarkets()
  }, [network])

  return (
    <TradeContext.Provider value={{ loading, markets }}>
      {children}
    </TradeContext.Provider>
  )
}
