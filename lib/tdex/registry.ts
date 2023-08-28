import { NetworkNames, TradeStatusMessage } from '../constants'
import { TDEXv2Provider, isTDEXv2Provider } from '../types'
import axios from 'axios'

const DEFAULT_TOR_PROXY = 'https://proxy.tdex.network'

/**
 * Get tdex registry url based on network selected on Marina
 * @param network network name
 * @returns url
 */
function getRegistryURL(network: NetworkNames): string {
  const Registries = {
    [NetworkNames.MAINNET]:
      'https://raw.githubusercontent.com/tdex-network/tdex-registry/master/registry.json',
    [NetworkNames.TESTNET]:
      'https://raw.githubusercontent.com/tdex-network/tdex-registry/testnet/registry.json',
  }
  return Registries[network] || Registries[NetworkNames.MAINNET]
}

/**
 * Queries provider through axios post to check for version v2
 * @param provider TDEXv2Provider
 * @returns boolean
 */
async function respondsWithCorrectVersion(
  provider: TDEXv2Provider,
): Promise<boolean> {
  try {
    const url = provider.endpoint + '/v1/info'
    const res = await axios.post(url, { list_services: '' })
    return res.data.result.listServicesResponse.service
      .map((s: { name: string }) => s.name)
      .includes('tdex.v2.TradeService')
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * We use the HTTP1 cleartext endpoint here provided by the public tor reverse proxy
 * https://pkg.go.dev/github.com/tdex-network/tor-proxy@v0.0.3/pkg/torproxy#NewTorProxy
 * host:port/<just_onion_host_without_dot_onion>/
 * @param provider TDEXv2Provider
 * @returns provider
 */
function getClearTextTorProxyUrl(provider: TDEXv2Provider): TDEXv2Provider {
  // if no onion endpoint, nothing to do here
  if (!provider.endpoint.includes('onion')) return provider
  // use tor proxy
  const url = new URL(provider.endpoint)
  const splitted = url.hostname.split('.')
  splitted.pop()
  const onionPubKey = splitted.join('.')
  const endpoint = `${DEFAULT_TOR_PROXY}/${onionPubKey}`
  return { ...provider, endpoint }
}

/**
 * Get a list of registered providers from TDEX_REGISTRY_URL
 * @param network network name
 * @returns a list of providers
 */
export async function getProvidersFromRegistry(
  network: NetworkNames = NetworkNames.MAINNET,
): Promise<TDEXv2Provider[]> {
  console.debug('getProvidersFromRegistry', network)
  const res = (await axios.get(getRegistryURL(network))).data
  // throw if invalid response
  if (!Array.isArray(res)) throw TradeStatusMessage.InvalidRegistry
  // check schema and transform onion addresses to clear web
  const providers = res.filter(isTDEXv2Provider).map(getClearTextTorProxyUrl)
  // check if providers respond with version v2
  const results = await Promise.all(providers.map(respondsWithCorrectVersion))
  // return only v2 providers
  return providers.filter((p, i) => results[i])
}
