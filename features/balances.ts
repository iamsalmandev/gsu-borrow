import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { zipObject } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { tokenBalance } from '../blockchain/calls/erc20'
import { CallObservable } from '../blockchain/calls/observe'
import { ContextConnected } from '@oasisdex/transactions/lib/src/callHelpersContextParametrized'

export function createBalances$(
  collaterals$: Observable<string[]>,
  balance$: CallObservable<typeof tokenBalance>,
  ethBalance$: (account: string) => Observable<BigNumber>,
  account: string,
): Observable<Dictionary<BigNumber>> {
  return collaterals$.pipe(
    switchMap((tokens) =>
      combineLatest(
        tokens.map((token) =>
          token === 'ETH' ? ethBalance$(account) : balance$({ token, account }),
        ),
      ).pipe(map((balances) => zipObject(tokens, balances))),
    ),
  )
}

export function createETHBalance$(context$: Observable<ContextConnected>, address: string) {
  return context$.pipe(
    switchMap((context) => context.web3.eth.getBalance(address)),
    map((ethBalance) => amountFromWei(new BigNumber(ethBalance))),
  )
}
