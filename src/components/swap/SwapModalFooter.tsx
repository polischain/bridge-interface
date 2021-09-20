import { Currency, CurrencyAmount, Trade, TradeType } from 'hadeswap-beta-sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import {
    computeSlippageAdjustedAmounts,
    computeTradePriceBreakdown,
    formatExecutionPrice,
    warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function SwapModalFooter({
    currency,
    amount,
    onConfirm,
    allowedSlippage,
    swapErrorMessage,
    disabledConfirm
}: {
    currency: Currency | undefined
    amount: CurrencyAmount | undefined
    allowedSlippage: number
    onConfirm: () => void
    swapErrorMessage: string | undefined
    disabledConfirm: boolean
}) {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const [showInverted, setShowInverted] = useState<boolean>(false)
    const theme = useContext(ThemeContext)
    const slippageAdjustedAmounts = amount

    return (
        <>
            <AutoColumn gap="0px">
                <RowBetween align="center">
                    <Text
                        fontWeight={500}
                        fontSize={14}
                        color={theme.text1}
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            textAlign: 'right',
                            paddingLeft: '10px'
                        }}
                    >
                    </Text>
                </RowBetween>

                <RowBetween>
                    <RowFixed>
                        <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                            { i18n._(t`Minimum received`)
                               }
                        </TYPE.black>
                        <QuestionHelper
                            text={i18n._(
                                t`Your will receive this amount on the other chain.`
                            )}
                        />
                    </RowFixed>
                    <RowFixed>
                        <TYPE.black fontSize={14}>
                            {amount?.toSignificant(4) }
                        </TYPE.black>
                        <TYPE.black fontSize={14} marginLeft={'4px'}>
                            { currency?.getSymbol(chainId)}
                        </TYPE.black>
                    </RowFixed>
                </RowBetween>

            </AutoColumn>

            <AutoRow>
                <ButtonError
                    onClick={onConfirm}
                    disabled={disabledConfirm}
                    style={{ margin: '10px 0 0 0' }}
                    id="confirm-swap-or-send"
                >
                    <Text fontSize={20} fontWeight={500}>
                        {i18n._(t`Confirm Bridge`)}
                    </Text>
                </ButtonError>

                {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </AutoRow>
        </>
    )
}
