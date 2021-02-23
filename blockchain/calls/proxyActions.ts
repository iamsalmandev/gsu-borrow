import { BigNumber } from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { amountToWei } from 'blockchain/utils'
import { zero } from 'helpers/zero'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DssProxyActions } from 'types/web3-v1-contracts/dss-proxy-actions'
import Web3 from 'web3'

import { TxMetaKind } from './txMeta'

export type ProxyActionWithdrawAndPaybackData = {
  kind: TxMetaKind.proxyActionWithdrawAndPayback
  id: BigNumber
  token: string
  ilk: string
  withdrawAmount: BigNumber
  paybackAmount: BigNumber
  proxyAddress: string
}

function getWithdrawAndPaybackCallData(
  data: ProxyActionWithdrawAndPaybackData,
  context: ContextConnected,
) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, joins, contract } = context
  const { id, token, withdrawAmount, paybackAmount, ilk } = data

  if (withdrawAmount.gt(zero) && paybackAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.wipeAndFreeETH(
        dssCdpManager.address,
        joins[ilk],
        mcdJoinDai.address,
        id.toString(),
        amountToWei(withdrawAmount, token).toFixed(0),
        amountToWei(paybackAmount, 'DAI').toFixed(0),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.wipeAndFreeGem(
      dssCdpManager.address,
      joins[ilk],
      mcdJoinDai.address,
      id.toString(),
      amountToWei(withdrawAmount, token).toFixed(0),
      amountToWei(paybackAmount, 'DAI').toFixed(0),
    )
  }

  if (withdrawAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.freeETH(
        dssCdpManager.address,
        joins[ilk],
        id.toString(),
        amountToWei(withdrawAmount, token).toFixed(0),
      )
    }
    return contract<DssProxyActions>(dssProxyActions).methods.freeGem(
      dssCdpManager.address,
      joins[ilk],
      id.toString(),
      amountToWei(withdrawAmount, token).toFixed(0),
    )
  }
  return contract<DssProxyActions>(dssProxyActions).methods.wipe(
    dssCdpManager.address,
    mcdJoinDai.address,
    id.toString(),
    amountToWei(paybackAmount, 'DAI').toFixed(0),
  )
}

export const proxyActionWithdrawAndPayback: TransactionDef<ProxyActionWithdrawAndPaybackData> = {
  call: ({ proxyAddress }, { contract }) => {
    return (contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods as any)[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getWithdrawAndPaybackCallData(data, context).encodeABI()]
  },
}

export type ProxyActionDepositAndGenerateData = {
  kind: TxMetaKind.proxyActionDepositAndGenerate
  id: BigNumber
  token: string
  ilk: string
  depositAmount: BigNumber
  generateAmount: BigNumber
  proxyAddress: string
}

function getDepositAndGenerateCallData(
  data: ProxyActionDepositAndGenerateData,
  context: ContextConnected,
) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context
  const { id, token, depositAmount, generateAmount, ilk } = data

  if (depositAmount.gt(zero) && generateAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.lockETHAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[ilk],
        mcdJoinDai.address,
        id.toString(),
        amountToWei(generateAmount, 'DAI').toFixed(0),
      )
    }
    return contract<DssProxyActions>(dssProxyActions).methods.lockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      id.toString(),
      amountToWei(depositAmount, token).toFixed(0),
      amountToWei(generateAmount, 'DAI').toFixed(0),
      true,
    )
  }

  if (depositAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.lockETH(
        dssCdpManager.address,
        joins[ilk],
        id.toString(),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.lockGem(
      dssCdpManager.address,
      joins[ilk],
      id.toString(),
      amountToWei(depositAmount, token).toFixed(0),
      true,
    )
  }

  return contract<DssProxyActions>(dssProxyActions).methods.draw(
    dssCdpManager.address,
    mcdJug.address,
    mcdJoinDai.address,
    id.toString(),
    amountToWei(generateAmount, 'DAI').toFixed(0),
  )
}

export const proxyActionDepositAndGenerate: TransactionDef<ProxyActionDepositAndGenerateData> = {
  call: ({ proxyAddress }, { contract }) => {
    return (contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods as any)[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getDepositAndGenerateCallData(data, context).encodeABI()]
  },
  options: ({ token, depositAmount }) =>
    token === 'ETH' ? { value: amountToWei(depositAmount, 'ETH').toString() } : {},
}

export type ProxyActionOpenData = {
  kind: TxMetaKind.proxyActionOpen
  token: string
  ilk: string
  depositAmount: BigNumber
  generateAmount: BigNumber
  proxyAddress: string
}

function getOpenCallData(data: ProxyActionOpenData, context: ContextConnected) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context
  const { depositAmount, generateAmount, token, ilk, proxyAddress } = data

  if (depositAmount.gt(zero) && generateAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[ilk],
        mcdJoinDai.address,
        Web3.utils.utf8ToHex(ilk),
        amountToWei(generateAmount, 'DAI').toFixed(0),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(depositAmount, token).toFixed(0),
      amountToWei(generateAmount, 'DAI').toFixed(0),
      true,
    )
  }

  return contract<DssProxyActions>(dssProxyActions).methods.open(
    dssCdpManager.address,
    Web3.utils.utf8ToHex(ilk),
    proxyAddress,
  )
}

export const proxyActionOpen: TransactionDef<ProxyActionOpenData> = {
  call: ({ proxyAddress }, { contract }) => {
    return (contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods as any)[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getOpenCallData(data, context).encodeABI()]
  },
  options: ({ token, depositAmount }) =>
    token === 'ETH' ? { value: amountToWei(depositAmount, 'ETH').toString() } : {},
}
