import { CurrencyAmount, JSBI, Pair, Token, Trade } from 'hadeswap-beta-sdk'
import useBridgeParams from '../hooks/useBridgeParams'

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
