import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { AppSpinnerWholePage, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithTermsOfService } from '../../../features/termsOfService/TermsOfService'

// TODO Move this to /features
function Summary({ address }: { address: string }) {
  const { vaultsOverview$, context$ } = useAppContext()
  const vaultsOverview = useObservableWithError(vaultsOverview$(address))
  const context = useObservableWithError(context$)

  // if (vaultsOverview === undefined || context === undefined) {
  // return <AppSpinnerWholePage />
  // }

  // if (!context) {
  //   return <div>loading context</div>
  // }

  // return (
  //   <WithLoadingIndicator {...vaultsOverview}>
  //     {(vaultsOverview) => (
  //       <WithLoadingIndicator {...context}>
  //         {(context) => (
  //           <VaultsOverviewView
  //             vaultsOverview={vaultsOverview}
  //             context={context}
  //             address={address}
  //           />
  //         )}
  //       </WithLoadingIndicator>
  //     )}
  //   </WithLoadingIndicator>
  // )

  return (
    <WithLoadingIndicator
      value={[vaultsOverview.value, context.value]}
      error={[vaultsOverview.error, context.error]}
    >
      {([vaultsOverview, context]) => {
        console.log(vaultsOverview, context)

        return (
          <VaultsOverviewView vaultsOverview={vaultsOverview} context={context} address={address} />
        )
      }}
    </WithLoadingIndicator>
  )
}

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

export default function VaultsSummary({ address }: { address: string }) {
  return address ? (
    <WithConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <Summary address={address} />
      </WithTermsOfService>
    </WithConnection>
  ) : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
}
