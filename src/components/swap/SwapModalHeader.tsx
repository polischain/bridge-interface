import { Currency, CurrencyAmount, Trade, TradeType } from 'hadeswap-beta-sdk'
import React, { useContext, useMemo } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { ButtonPrimary } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'
import { t, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function SwapModalHeader({
    currency,
    amount,
    allowedSlippage,
    recipient,
    showAcceptChanges,
    onAcceptChanges
}: {
    currency: Currency
    amount: CurrencyAmount
    allowedSlippage: number
    recipient: string | null
    showAcceptChanges: boolean
    onAcceptChanges: () => void
}) {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const slippageAdjustedAmounts = amount

    const theme = useContext(ThemeContext)

    return (
        <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
            <RowBetween align="flex-end">
                <RowFixed gap={'0px'}>
                    <CurrencyLogo currency={currency} size={'24px'} style={{ marginRight: '12px' }} />
                    <TruncatedText
                        fontSize={24}
                        fontWeight={500}
                        color={theme.primary1}
                    >
                        {amount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap={'0px'}>
                    <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
                        {currency.getSymbol(chainId)}
                    </Text>
                </RowFixed>
            </RowBetween>
            <RowFixed>
                <ArrowDown size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }} />
            </RowFixed>
            <RowBetween align="flex-end">
                <RowFixed gap={'0px'}>
                    <CurrencyLogo
                        currency={currency}
                        size={'24px'}
                        style={{ marginRight: '12px' }}
                    />
                    <TruncatedText
                        fontSize={24}
                        fontWeight={500}
                        color={theme.primary1}
                    >
                        {amount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap={'0px'}>
                    <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
                        {currency.getSymbol(chainId)}
                    </Text>
                </RowFixed>
            </RowBetween>
            {showAcceptChanges ? (
                <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
                    <RowBetween>
                        <RowFixed>
                            <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
                            <TYPE.main color={theme.primary1}> {i18n._(t`Price Updated`)}</TYPE.main>
                        </RowFixed>
                        <ButtonPrimary
                            style={{
                                padding: '.5rem',
                                width: 'fit-content',
                                fontSize: '0.825rem',
                                borderRadius: '12px'
                            }}
                            onClick={onAcceptChanges}
                        >
                            {i18n._(t`Accept`)}
                        </ButtonPrimary>
                    </RowBetween>
                </SwapShowAcceptChanges>
            ) : null}
            <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
                 <TYPE.italic textAlign="left" style={{ width: '100%' }}>
                        <Trans>
                            Output is estimated. You will receive at least{' '}
                            <b>
                                {amount?.toSignificant(6)}{' '}
                                {currency.getSymbol(chainId)}
                            </b>{' '}
                            or the transaction will revert.
                        </Trans>
                    </TYPE.italic>
            </AutoColumn>
            {recipient !== null ? (
                <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
                    <TYPE.main>
                        <Trans>
                            Output will be sent to{' '}
                            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
                        </Trans>
                    </TYPE.main>
                </AutoColumn>
            ) : null}
        </AutoColumn>
    )
}
