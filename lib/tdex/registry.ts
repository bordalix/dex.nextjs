import { NetworkNames, TradeStatusMessage } from '../constants'
import { TDEXv2Provider, isTDEXv2Provider } from '../types'
import axios from 'axios'

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
 * Get a list of registered providers from TDEX_REGISTRY_URL
 * @param network network name
 * @returns a list of providers
 */
export async function getProvidersFromRegistry(
  network: NetworkNames = NetworkNames.MAINNET,
): Promise<TDEXv2Provider[]> {
  const res = (await axios.get(getRegistryURL(network))).data
  if (!Array.isArray(res)) throw TradeStatusMessage.InvalidRegistry
  return res.filter(isTDEXv2Provider).filter(respondsWithCorrectVersion)
}
