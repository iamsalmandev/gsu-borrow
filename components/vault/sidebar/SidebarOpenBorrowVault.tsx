import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { getHeaderButton } from 'features/sidebar/getHeaderButton'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import {
  progressTrackingEvent,
  regressTrackingEvent,
} from 'features/sidebar/trackingEventOpenVault'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractAllowanceDataFromOpenVaultState,
  extractSidebarButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { isFirstCdp } from '../../../helpers/isFirstCdp'
import { SidebarOpenBorrowVaultEditingStage } from './SidebarOpenBorrowVaultEditingStage'
import { SidebarOpenBorrowVaultOpenStage } from './SidebarOpenBorrowVaultOpenStage'
import { SidebarOpenVaultAllowanceStage } from './SidebarOpenVaultAllowanceStage'
import { SidebarOpenVaultProxyStage } from './SidebarOpenVaultProxyStage'

export function SidebarOpenBorrowVault(props: OpenVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    id,
    stage,
    canProgress,
    progress,
    canRegress,
    regress,
    isEditingStage,
    isProxyStage,
    isAllowanceStage,
    isOpenStage,
    isLoadingStage,
    isSuccessStage,
    token,
    totalSteps,
    currentStep,
    ilk,
    updateDeposit,
    inputAmountsEmpty,
  } = props

  const gasData = extractGasDataFromState(props)
  const sidebarPrimaryButtonLabelParams = extractSidebarButtonLabelParams({
    flow: 'openBorrow',
    ...props,
  })
  const firstCDP = isFirstCdp(accountData)
  const allowanceData = extractAllowanceDataFromOpenVaultState(props)
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow: 'openBorrow', stage, token }),
    headerButton: getHeaderButton({
      stage,
      canResetForm: isEditingStage && !inputAmountsEmpty,
      resetForm: () => {
        updateDeposit!(undefined)
      },
      canRegress,
      regress,
      regressCallback: () => {
        regressTrackingEvent({ props, firstCDP })
      },
    }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenBorrowVaultEditingStage {...props} />}
        {isProxyStage && <SidebarOpenVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarOpenVaultAllowanceStage {...allowanceData} />}
        {isOpenStage && <SidebarOpenBorrowVaultOpenStage {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel(sidebarPrimaryButtonLabelParams),
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress,
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
      },
      url: isSuccessStage ? `/${id}` : undefined,
    },
    ...(isEditingStage &&
      ALLOWED_MULTIPLY_TOKENS.includes(token) && {
        textButton: {
          label: t('system.actions.borrow.switch-to-multiply'),
          url: `/vaults/open-multiply/${ilk}`,
        },
      }),
    progress: getSidebarProgress(sidebarTxData),
    success: getSidebarSuccess(sidebarTxData),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
