import { Coin, TDEXv2Provider } from 'lib/types'
import Modal, { ModalIds } from './modal'
import Image from 'next/image'
import { closeModal } from 'lib/utils'
import { supportedAssets } from 'lib/assets'
import { WalletContext } from 'providers/wallet'
import { useContext } from 'react'
import { TradeContext } from 'providers/trade'

interface ProviderListModalProps {
  providers: TDEXv2Provider[]
  setUseProvider: (arg: TDEXv2Provider | undefined) => void
  useProvider?: TDEXv2Provider
}

const ProviderListModal = ({
  providers,
  setUseProvider,
  useProvider,
}: ProviderListModalProps) => {
  // fake provider, to be first line of the list.
  // the default provider is no provider at all,
  // the app selects the provider with better market for given pair.
  const fakeProvider = {
    name: 'Automatic',
    endpoint: 'Finds provider with best market for given pair',
  }

  // if the user choose the fake provider, we setUseProvider to undefined
  const handleClick = (provider: TDEXv2Provider) => {
    const isFakeProvider = provider.endpoint === fakeProvider.endpoint
    setUseProvider(isFakeProvider ? undefined : provider)
    closeModal(ModalIds.ProviderList)
  }

  // reusable icon
  const Icon = ({ status }: { status: string }) => (
    <Image
      src={`/images/icons/${status}.svg`}
      className="pr-2"
      alt={`${status} icon`}
      height={32}
      width={32}
    />
  )

  // checks if a given provider is the selected one and returns icon
  const IconForProvider = ({ provider }: { provider: TDEXv2Provider }) => {
    if (!useProvider) {
      return provider.endpoint === fakeProvider.endpoint ? (
        <Icon status="checked" />
      ) : (
        <Icon status="empty" />
      )
    }
    return provider.endpoint === useProvider.endpoint ? (
      <Icon status="checked" />
    ) : (
      <Icon status="empty" />
    )
  }

  const ProviderLine = ({ provider }: any) => (
    <div className="is-flex is-clickable" style={{ marginLeft: -32 }}>
      <p style={{ minWidth: 32 }}>
        <IconForProvider provider={provider} />
      </p>
      <div onClick={() => handleClick(provider)} style={{ width: '100%' }}>
        <p className="has-text-white">{provider.name}</p>
        <p className="is-size-7 mb-4 is-ellipsis">{provider.endpoint}</p>
      </div>
    </div>
  )

  if (!providers) return <></>

  return (
    <Modal id={ModalIds.ProviderList}>
      <div className="columns">
        <div className="column is-half is-offset-one-quarter">
          <h1 className="title has-text-white">Select a provider</h1>
          {[fakeProvider, ...providers].map((provider, index) => (
            <ProviderLine provider={provider} key={index} />
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default ProviderListModal
