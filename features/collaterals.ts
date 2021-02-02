import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { Context } from '../blockchain/network'

export function createCollaterals$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(map((context) => context.collaterals))
}
