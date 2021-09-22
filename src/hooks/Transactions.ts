import { ChainId, Currency, CurrencyAmount, JSBI, Pair, Token, Trade } from 'hadeswap-beta-sdk'
import { useMemo } from 'react'
import { useUserSingleHopOnly } from 'state/user/hooks'
import { isTradeBetter } from 'utils/trades'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useUnsupportedTokens } from './Tokens'
import { BigNumber } from 'ethers'
import useBridgeParams from '../hooks/useBridgeParams'
import Fraction from '../entities/Fraction'


export function useIsTransactionUnsupported(paramType: number, amountIn?: CurrencyAmount, ): boolean {
    const unsupportedToken: { [address: string]: Token } = useUnsupportedTokens()
    const { chainId } = useActiveWeb3React()
    const params = useBridgeParams()

    if(!amountIn) {
        return false
    }



    let paramToCompare = params.dailyLimit
    let result = true
    let paramInFormat: string
    // 0: dailyLimit, 1: maxPerTx, 2: minPerTx
    switch (paramType) {
        case 0:
            paramInFormat = Fraction.from(paramToCompare, BigNumber.from(10).pow(18)).toString(18)
            result = amountIn.lessThan(paramInFormat)
            break;
        case 1:
            paramToCompare = params.maxPerTx
            paramInFormat = Fraction.from(paramToCompare, BigNumber.from(10).pow(18)).toString(18)
            result = amountIn.lessThan(paramInFormat)
            break;
        case 2:
            paramToCompare = params.minPerTx
            paramInFormat = Fraction.from(paramToCompare, BigNumber.from(10).pow(18)).toString(18)
            result = JSBI.greaterThanOrEqual(amountIn.raw, JSBI.BigInt(paramToCompare))
            console.log('min per tx', amountIn, paramToCompare, paramInFormat, result, amountIn.raw, paramToCompare.toFixed(18))
            break;
    }

    return !result
}
