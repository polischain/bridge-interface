import { ChainId, Currency, CurrencyAmount, JSBI, Pair, Token, Trade } from 'hadeswap-beta-sdk'
import { useMemo } from 'react'
import { useUserSingleHopOnly } from 'state/user/hooks'
import { isTradeBetter } from 'utils/trades'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import useSWR from 'swr'
import  { abi as BridgeForeignABI }  from '../constants/abis/bridge_foreign.json'
import  { abi as BridgeHomeABI }  from '../constants/abis/bridge_home.json'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useUnsupportedTokens } from './Tokens'
import { BigNumber, ethers } from 'ethers'
import useBridgeParams from '../hooks/useBridgeParams'
import Fraction from '../entities/Fraction'
import { BRIDGE_ADDRESS, BRIDGE_SENT_QUERY, CHAIN_BRIDGES } from '../constants'


export function useIsTransactionUnsupported(amountIn?: CurrencyAmount): { daily: boolean; min: boolean; max: boolean } {
    const params = useBridgeParams()

    if(!amountIn || !params) {
        return { daily: false, min: false, max: false }
    }

    // Daily check
    let unsupportedDaily = JSBI.lessThanOrEqual(amountIn.raw, JSBI.BigInt(params.dailyAllowance.numerator))

    // Min check
    let unsupportedMin
    unsupportedMin = JSBI.greaterThanOrEqual(amountIn.raw, JSBI.BigInt(params.minPerTx.numerator))


    // Max check
    let unsupportedMax
    unsupportedMax = JSBI.lessThanOrEqual(amountIn.raw, JSBI.BigInt(params.maxPerTx.numerator))


    return { daily: !unsupportedDaily, min: !unsupportedMin, max: !unsupportedMax }
}
