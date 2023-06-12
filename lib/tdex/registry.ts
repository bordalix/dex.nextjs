import { NetworkNames } from '../constants'
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

/**
 * Get a list of registered providers from TDEX_REGISTRY_URL
 * @param network network name
 * @returns a list of providers
 */
export async function getProvidersFromRegistry(
  network: NetworkNames = NetworkNames.MAINNET,
): Promise<TDEXv2Provider[]> {
  // TODO: remove this after registry is updated
  if (network === NetworkNames.TESTNET) {
    return [
      {
        name: 'v1.provider.tdex.network',
        endpoint: 'https://v1.provider.tdex.network',
      },
    ]
  }
  // end of TODO
  const res = (await axios.get(getRegistryURL(network))).data
  if (!Array.isArray(res)) throw new Error('Invalid registry response')
  return res.filter(isTDEXv2Provider)
}
