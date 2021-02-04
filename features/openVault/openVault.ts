import BigNumber from 'bignumber.js'
import { TxHelpers } from 'components/AppContext'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'

import {
  ApplyChange,
  applyChange,
  Change,
  Changes,
  GasEstimationStatus,
  HasGasEstimation,
  transactionToX,
} from 'helpers/form'
import { curry } from 'lodash'
import { combineLatest, EMPTY, merge, Observable, of, Subject } from 'rxjs'
import { filter, first, map, scan, shareReplay, switchMap } from 'rxjs/operators'
import { TxStatus } from '@oasisdex/transactions'

export type OpenVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFiasco'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFiasco'
  | 'transactionWaitingForConfirmation'
  | 'transactionWaitingForApproval'
  | 'transactionInProgress'
  | 'transactionFiasco'
  | 'transactionSuccess'

type OpenVaultMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanBalance'
}

type OpenVaultChange = Changes<OpenVaultState>

export type ManualChange =
  | Change<OpenVaultState, 'lockAmount'>
  | Change<OpenVaultState, 'drawAmount'>

export interface OpenVaultState extends HasGasEstimation {
  stage: OpenVaultStage
  proxyAddress?: string
  allowance?: boolean
  proxyTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  allowanceTxHash?: string
  openVaultTxHash?: string
  ilk: string
  token: string
  ilkData: IlkData
  balance: BigNumber
  // emergency shutdown!
  lockAmount?: BigNumber
  drawAmount?: BigNumber
  messages: OpenVaultMessage[]
  txError?: any
  change?: (change: ManualChange) => void
  createProxy?: () => void
  setAllowance?: () => void
  continue2ConfirmOpenVault?: () => void
  openVault?: () => void
  continue2Editing?: () => void
  tryAgain?: () => void
  back?: () => void
  close?: () => void
}

const apply: ApplyChange<OpenVaultState> = applyChange

function createProxy(
  { safeConfirmations }: ContextConnected,
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenVaultChange) => void,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<OpenVaultChange, CreateDsProxyData>(
        { kind: 'stage', stage: 'proxyWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'proxyTxHash', proxyTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'proxyInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'proxyFiasco',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        (txState) => {
          return proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              (txState as any).confirmations < safeConfirmations
                ? of({
                    kind: 'proxyConfirmations',
                    proxyConfirmations: (txState as any).confirmations,
                  })
                : of(
                    { kind: 'proxyAddress', proxyAddress: proxyAddress! },
                    { kind: 'stage', stage: 'allowanceWaiting4Confirmation' },
                  ),
            ),
          )
        },
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}

function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  allowance$: Observable<boolean>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
  })
    .pipe(
      transactionToX<OpenVaultChange, ApproveData>(
        { kind: 'stage', stage: 'allowanceWaitingForApproval' },
        (txState) =>
          of(
            {
              kind: 'allowanceTxHash',
              allowanceTxHash: (txState as any).txHash as string,
            },
            { kind: 'stage', stage: 'allowanceInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'allowanceFiasco',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () =>
          allowance$.pipe(
            filter((allowance) => allowance),
            switchMap(() => of({ kind: 'stage', stage: 'editingWaitingToContinue' })),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

// openVault
function openVault(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: OpenVaultChange) => void,
  { lockAmount, drawAmount, proxyAddress }: OpenVaultState,
) {
  return of(undefined)
  // sendWithGasEstimation(, {
  //   kind: TxMetaKind.lockAndDraw,
  //   proxyAddress: proxyAddress!,
  //   amount: amount!,
  // })
  //   .pipe(
  //     transactionToX<VaultCreationChange, DsrJoinData>(
  //       { kind: 'stage', stage: 'openVaultWaiting4Approval' },
  //       (txState) =>
  //         of(
  //           { kind: 'openVaultTxHash', openVaultTxHash: (txState as any).txHash as string },
  //           { kind: 'stage', stage: 'openVaultInProgress' },
  //         ),
  //       (txState) => {
  //         return of(
  //           {
  //             kind: 'stage',
  //             stage: 'openVaultFiasco',
  //           },
  //           {
  //             kind: 'txError',
  //             txError:
  //               txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
  //                 ? txState.error
  //                 : undefined,
  //           },
  //         )
  //       },
  //       () => of({ kind: 'stage', stage: 'openVaultSuccess' }),
  //     ),
  //   )
  //   .subscribe((ch) => change(ch))
}

function addTransitions(
  context: ContextConnected,
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  allowance$: Observable<boolean>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
): OpenVaultState {
  console.log(state)
  function backToOpenVaultEditing() {
    change({ kind: 'stage', stage: 'editing' })
  }

  function close() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'lockAmount', lockAmount: undefined })
    change({ kind: 'drawAmount', drawAmount: undefined })
  }

  if (state.stage === 'proxyWaitingForConfirmation') {
    return {
      ...state,
      createProxy: () => createProxy(context, txHelpers, proxyAddress$, change),
    }
  }

  if (state.stage === 'proxyFiasco') {
    return {
      ...state,
      tryAgain: () => createProxy(context, txHelpers, proxyAddress$, change),
    }
  }

  if (state.stage === 'allowanceWaitingForConfirmation') {
    return {
      ...state,
      setAllowance: () => setAllowance(txHelpers, allowance$, change, state),
    }
  }

  if (state.stage === 'allowanceFiasco') {
    return {
      ...state,
      tryAgain: () => setAllowance(txHelpers, allowance$, change, state),
    }
  }

  // if (state.stage === 'editingWaitingToContinue') {
  //   return {
  //     ...state,
  //     continue2Editing: () => change({ kind: 'stage', stage: 'editing' }),
  //   }
  // }

  if (state.stage === 'editing') {
    if (state.messages.length === 0) {
      return {
        ...state,
        change,
        // continue2ConfirmOpenVault: () =>
        //   change({ kind: 'stage', stage: 'transactionWaitingForConfirmation' }),
      }
    }
    return {
      ...state,
      change,
    }
  }

  if (state.stage === 'transactionWaitingForConfirmation') {
    return {
      ...state,
      openVault: () => openVault(txHelpers, change, state),
      back: backToOpenVaultEditing,
    }
  }

  if (state.stage === 'transactionFiasco') {
    return {
      ...state,
      tryAgain: () => openVault(txHelpers, change, state),
      back: backToOpenVaultEditing,
    }
  }

  if (state.stage === 'transactionSuccess') {
    return {
      ...state,
      close,
    }
  }

  return state
}

function validate(state: OpenVaultState): OpenVaultState {
  // const messages: DsrCreationMessage[] = []
  // if (!state.amount || state.amount.eq(zero)) {
  //   messages[messages.length] = { kind: 'amountIsEmpty' }
  // }
  // if (state.amount && state.daiBalance && state.amount.gt(state.daiBalance)) {
  //   messages[messages.length] = { kind: 'amountBiggerThanBalance' }
  // }
  // return { ...state, messages }
  return state
}

// function constructEstimateGas(
//   addGasEstimation: AddGasEstimationFunction,
//   state: OpenVaultState,
// ): Observable<OpenVaultState> {
//   return addGasEstimation(state, ({ estimateGas }: TxHelpers) => {
//     const { proxyAddress, stage, amount } = state
//
//     if (stage === 'proxyWaiting4Confirmation' || stage === 'proxyFiasco') {
//       return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
//     }
//
//     if (
//       proxyAddress &&
//       (stage === 'allowanceWaiting4Confirmation' || stage === 'allowanceFiasco')
//     ) {
//       return estimateGas(approve, {
//         token: 'DAI',
//         spender: proxyAddress,
//         kind: TxMetaKind.approve,
//       })
//     }
//
//     return undefined
//   })
// }

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<any> {
  return combineLatest(context$, txHelpers$).pipe(
    first(),
    switchMap(([context, txHelpers]) => {
      const account = context.account
      const token = ilk.split('-')[0]

      return combineLatest(proxyAddress$(account), balance$(token, account), ilkData$(ilk)).pipe(
        switchMap(([proxyAddress, balance, ilkData]) =>
          ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
            switchMap((allowance: boolean | undefined) => {
              console.log(balance)
              const initialState: OpenVaultState = {
                stage: 'editing',
                balance,
                ilkData,
                ilk,
                token,
                proxyAddress,
                allowance,
                messages: [],
                safeConfirmations: context.safeConfirmations,
                gasEstimationStatus: GasEstimationStatus.unset,
              }

              const change$ = new Subject<OpenVaultChange>()

              function change(ch: OpenVaultChange) {
                change$.next(ch)
              }

              const balanceChange$ = balance$(token, account).pipe(
                map((balance) => ({ kind: 'balance', balance })),
              )

              const ilkDataChange$ = ilkData$(ilk).pipe(
                map((ilkData) => ({ kind: 'ilkData', ilkData })),
              )

              const environmentChange$ = merge(balanceChange$, ilkDataChange$)

              const connectedProxyAddress$ = proxyAddress$(account)

              const connectedAllowance$ = proxyAddress$(account).pipe(
                switchMap((proxyAddress) =>
                  proxyAddress ? allowance$(token, account, proxyAddress) : EMPTY,
                ),
              )

              return merge(change$, environmentChange$).pipe(
                scan(apply, initialState),
                map(validate),
                map(
                  curry(addTransitions)(
                    context,
                    txHelpers,
                    connectedProxyAddress$,
                    connectedAllowance$,
                    change,
                  ),
                ),
              )
            }),
          ),
        ),
        shareReplay(1),
      )
    }),
  )
}
