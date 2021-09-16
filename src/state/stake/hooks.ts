import { ChainId, CurrencyAmount, JSBI, Pair, Token, TokenAmount, WETH } from 'hadeswap-beta-sdk'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useMemo } from 'react'
import { DAI, USDC, USDT, WBTC } from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const STAKING_GENESIS = 1600387200

export const REWARDS_DURATION_DAYS = 60


export interface StakingInfo {
    // the address of the reward contract
    stakingRewardAddress: string
    // the tokens involved in this pair
    tokens: [Token, Token]
    // the amount of token currently staked, or undefined if no account
    stakedAmount: TokenAmount
    // the amount of reward token earned by the active account, or undefined if no account
    earnedAmount: TokenAmount
    // the total amount of token staked in the contract
    totalStakedAmount: TokenAmount
    // the amount of token distributed per second to all LPs, constant
    totalRewardRate: TokenAmount
    // the current amount of token distributed to the active account per second.
    // equivalent to percent of total supply * reward rate
    rewardRate: TokenAmount
    // when the period ends
    periodFinish: Date | undefined
    // if pool is active
    active: boolean
    // calculates a hypothetical amount of token distributed to the active account per second.
    getHypotheticalRewardRate: (
        stakedAmount: TokenAmount,
        totalStakedAmount: TokenAmount,
        totalRewardRate: TokenAmount
    ) => TokenAmount
}




// based on typed value
export function useDerivedStakeInfo(
    typedValue: string,
    stakingToken: Token,
    userLiquidityUnstaked: TokenAmount | undefined
): {
    parsedAmount?: CurrencyAmount
    error?: string
} {
    const { i18n } = useLingui()
    const { account } = useActiveWeb3React()

    const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

    const parsedAmount =
        parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
            ? parsedInput
            : undefined

    let error: string | undefined
    if (!account) {
        error = i18n._(t`Connect Wallet`)
    }
    if (!parsedAmount) {
        error = error ?? i18n._(t`Enter an amount`)
    }

    return {
        parsedAmount,
        error
    }
}

// based on typed value
export function useDerivedUnstakeInfo(
    typedValue: string,
    stakingAmount: TokenAmount
): {
    parsedAmount?: CurrencyAmount
    error?: string
} {
    const { i18n } = useLingui()
    const { account } = useActiveWeb3React()

    const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

    const parsedAmount =
        parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

    let error: string | undefined
    if (!account) {
        error = i18n._(t`Connect Wallet`)
    }
    if (!parsedAmount) {
        error = error ?? i18n._(t`Enter an amount`)
    }

    return {
        parsedAmount,
        error
    }
}
