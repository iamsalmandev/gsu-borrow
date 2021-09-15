/* eslint-disable func-style */

import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'

import { getVaultChange } from '../manageMultiplyVaultCalculations'

describe('Adjust multiply calculations', () => {
  it('Increase multiply', () => {
    const debt = new BigNumber(1000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)

    const requiredCollRatio = new BigNumber(2)

    const { debtDelta, collateralDelta, loanFee } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta).plus(loanFee))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })

  it.skip('Decrease multiply', () => {
    const debt = new BigNumber(2000)
    const lockedCollateral = new BigNumber(5)
    const oraclePrice = new BigNumber(1000)
    const marketPrice = new BigNumber(1010)
    const slippage = new BigNumber(0.05)

    const requiredCollRatio = new BigNumber(5)

    const { debtDelta, collateralDelta } = getVaultChange({
      requiredCollRatio,
      debt,
      lockedCollateral,
      currentCollateralPrice: oraclePrice,
      marketPrice,
      slippage,
      depositAmount: zero,
      paybackAmount: zero,
      withdrawAmount: zero,
      generateAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    const afterCollateralizationRatio = lockedCollateral
      .plus(collateralDelta)
      .times(oraclePrice)
      .div(debt.plus(debtDelta))

    expect(afterCollateralizationRatio).to.deep.eq(requiredCollRatio)
  })

  it('Calculates net value USD, after net value USD, after collateral delta USD using market price', () => {
    const expectedNetValueUSD = new BigNumber('2500')

    const afterCollRatio = new BigNumber('2')
    const expectedAfterCollateralDelta = new BigNumber('4.58067535578901113454')
    const expectedAfterCollateralDeltaUSD = new BigNumber('4580.67535578901113454')
    const expectedAfterNetValueUSD = new BigNumber('2463.719490631428618727573395')

    const state = getStateUnpacker(
      mockManageMultiplyVault$({
        vault: {
          collateral: new BigNumber('3'),
          debt: new BigNumber('500'),
          ilk: 'ETH-A',
        },
        exchangeQuote: {
          marketPrice: new BigNumber('1000'),
        },
      }),
    )

    // expect to have different market price and oracle price for this test
    expect(state().priceInfo.currentCollateralPrice).to.not.deep.equal(state().marketPrice)
    expect(state().collateralDelta).to.deep.equal(zero)
    expect(state().collateralDeltaUSD).to.deep.equal(zero)
    expect(state().netValueUSD).to.deep.equal(expectedNetValueUSD)

    state().updateRequiredCollRatio!(afterCollRatio)
    expect(state().collateralDelta).to.deep.equal(expectedAfterCollateralDelta)
    expect(state().collateralDeltaUSD).to.deep.equal(expectedAfterCollateralDeltaUSD)
    expect(state().afterNetValueUSD).to.deep.equal(expectedAfterNetValueUSD)
  })
})
