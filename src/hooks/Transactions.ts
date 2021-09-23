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


export function useIsTransactionUnsupported(amountIn?: CurrencyAmount): { daily: boolean; min: boolean; max: boolean } {
    const unsupportedToken: { [address: string]: Token } = useUnsupportedTokens()
    const { chainId } = useActiveWeb3React()
    const params = useBridgeParams()

    if(!amountIn || !params) {
        return { daily: true, min: true, max: true }
    }

    let result
    // Daily check
    let unsupportedDaily = false

    // Min check
    let unsupportedMin
    unsupportedMin = JSBI.greaterThanOrEqual(amountIn.raw, JSBI.BigInt(params.minPerTx.numerator))


    // Max check
    let unsupportedMax
    unsupportedMax = JSBI.lessThanOrEqual(amountIn.raw, JSBI.BigInt(params.maxPerTx.numerator))


    return { daily: unsupportedDaily, min: !unsupportedMin, max: !unsupportedMax }
}
