import { ApprovalState, useApproveCallback, useApproveCallbackFromBridge } from '../../hooks/useApproveCallback'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import { AutoRow, RowBetween } from '../../components/Row'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/ButtonLegacy'
import Card, { DarkCard, GreyCard } from '../../components/CardLegacy'
import { ChainId, Currency, CurrencyAmount, JSBI, Token, Trade } from 'hadeswap-beta-sdk'
import Column, { AutoColumn } from '../../components/Column'
import { LinkStyledButton, TYPE } from '../../theme'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import {
    useDefaultsFromURLSearch,
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance } from '../../state/user/hooks'
import { useNetworkModalToggle, useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'

import AddressInputPanel from '../../components/AddressInputPanel'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import { ArrowDown } from 'react-feather'
import { ClickableText } from '../Pool/styleds'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { Field } from '../../state/swap/actions'
import { Helmet } from 'react-helmet'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import Loader from '../../components/Loader'
import Lottie from 'lottie-react'
import ProgressSteps from '../../components/ProgressSteps'
import ReactGA from 'react-ga'
import SwapHeader from '../../components/ExchangeHeader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import TokenWarningModal from '../../components/TokenWarningModal'
import TradePrice from '../../components/swap/TradePrice'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import swapArrowsAnimationData from '../../assets/animation/swap-arrows.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import useENSAddress from '../../hooks/useENSAddress'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useLingui } from '@lingui/react'

export default function Swap() {
    const { i18n } = useLingui()
    const toggleNetworkModal = useNetworkModalToggle()

    const loadedUrlParams = useDefaultsFromURLSearch()

    // token warning stuff
    const [loadedOutputCurrency] = [
        useCurrency(loadedUrlParams?.outputCurrencyId)
    ]
    const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
    const urlLoadedTokens: Token[] = []

    const handleConfirmTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
    }, [])

    // dismiss warning if all imported tokens are in active lists
    const defaultTokens = useAllTokens()
    const importTokensNotInDefault =
        urlLoadedTokens &&
        urlLoadedTokens.filter((token: Token) => {
            return !Boolean(token.address in defaultTokens)
        })

    const { account, chainId } = useActiveWeb3React()

    const theme = useContext(ThemeContext)

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // for expert mode
    const toggleSettings = useToggleSettingsMenu()
    // const [isExpertMode] = useExpertModeManager()

    // get custom setting values for user
    const [allowedSlippage] = useUserSlippageTolerance()

    // swap state
    const independentField = Field.OUTPUT
    const { typedValue, recipient } = useSwapState()
    const { currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const { address: recipientAddress } = useENSAddress(recipient)

    const parsedAmounts = {
              [Field.INPUT]: parsedAmount,
              [Field.OUTPUT]: parsedAmount
          }

    const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field = Field.INPUT


    const userHasSpecifiedInputOutput = Boolean(
        currencies[Field.OUTPUT] &&
        parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput]
    )
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput]
    )

    // modal and loading
    const [{ showConfirm, currency, amount, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
        showConfirm: boolean
        currency: Currency | undefined
        amount: CurrencyAmount | undefined
        attemptingTxn: boolean
        swapErrorMessage: string | undefined
        txHash: string | undefined
    }>({
        showConfirm: false,
        currency: undefined,
        amount: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined
    })

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }

    const route = false
    const noRoute = !route

    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromBridge(parsedAmounts[Field.OUTPUT] )

    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    const maxAmountOutput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.OUTPUT])
    const atMaxAmountOutput = Boolean(maxAmountOutput && parsedAmounts[Field.OUTPUT]?.equalTo(maxAmountOutput))

    // the callback to execute the swap
    const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(currencies[Field.OUTPUT], parsedAmounts[independentField], 0, recipient)

    console.log("SWAPCALLBACK: ",swapCallbackError, recipient)

    const handleSwap = useCallback(() => {
        if (!swapCallback) {
            return
        }
        setSwapState({
            attemptingTxn: true,
            currency: currencies[Field.OUTPUT],
            amount: parsedAmounts[independentField],
            showConfirm,
            swapErrorMessage: undefined,
            txHash: undefined
        })
        swapCallback()
            .then(hash => {
                setSwapState({
                    attemptingTxn: false,
                    currency,
                    amount,
                    showConfirm,
                    swapErrorMessage: undefined,
                    txHash: hash
                })

                ReactGA.event({
                    category: 'Swap',
                    action:
                        recipient === null
                            ? 'Swap w/o Send'
                            : (recipientAddress ?? recipient) === account
                            ? 'Swap w/o Send + recipient'
                            : 'Swap w/ Send',
                    label: ''

                })

                ReactGA.event({
                    category: 'Routing',
                    action: 'Swap with multihop disabled'
                })
            })
            .catch(error => {
                setSwapState({
                    attemptingTxn: false,
                    currency,
                    amount,
                    showConfirm,
                    swapErrorMessage: error.message,
                    txHash: undefined
                })
            })
    }, [
        swapCallback,
        currency,
        amount,
        showConfirm,
        recipient,
        recipientAddress,
        account,
        chainId
    ])

    // errors
    const [showInverted, setShowInverted] = useState<boolean>(false)

    // warnings on slippage
    const priceImpactSeverity = 0

    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED))

    console.log('show approve flow: ', !swapInputError, approval)

    const handleConfirmDismiss = useCallback(() => {
        setSwapState({ showConfirm: false, currency, amount, attemptingTxn, swapErrorMessage, txHash })
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [attemptingTxn, onUserInput, swapErrorMessage, currency, amount, txHash])

    const handleAcceptChanges = useCallback(() => {
        setSwapState({ currency: undefined, amount: undefined, swapErrorMessage, txHash, attemptingTxn, showConfirm })
    }, [attemptingTxn, showConfirm, swapErrorMessage, currency, amount, txHash])

    const handleInputSelect = useCallback(
        inputCurrency => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            onCurrencySelection(Field.OUTPUT, inputCurrency)
        },
        [onCurrencySelection]
    )

    const handleMaxInput = useCallback(() => {
        maxAmountOutput && onUserInput(Field.OUTPUT, maxAmountOutput.toExact())
    }, [maxAmountOutput, onUserInput])

    const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
        onCurrencySelection
    ])

    // const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)
    const swapIsUnsupported = false

    console.log("PARAMETERS: ", isValid, account, userHasSpecifiedInputOutput, showApproveFlow)


    return (
        <>
            <Helmet>
                <title>{i18n._(t`Bridge`)}</title>
                <meta
                    name="description"
                    content="Move your coins between chains"
                />
            </Helmet>
            <TokenWarningModal
                isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
                tokens={importTokensNotInDefault}
                onConfirm={handleConfirmTokenWarning}
            />
            <SwapPoolTabs active={'swap'} />
            <div className="bg-dark-900 shadow-swap-blue-glow w-full max-w-2xl rounded">
                <SwapHeader input={currencies[Field.INPUT]} output={currencies[Field.OUTPUT]} />
                <Wrapper id="swap-page">
                    <ConfirmSwapModal
                        isOpen={showConfirm}
                        currency={currencies[Field.OUTPUT]}
                        amount={parsedAmounts[independentField]}
                        onAcceptChanges={handleAcceptChanges}
                        attemptingTxn={attemptingTxn}
                        txHash={txHash}
                        recipient={recipient}
                        allowedSlippage={0}
                        onConfirm={handleSwap}
                        swapErrorMessage={swapErrorMessage}
                        onDismiss={handleConfirmDismiss}
                    />
                    <AutoColumn gap={'md'}>

                        {/*<CurrencyInputPanel*/}
                        {/*    showMaxButton={!atMaxAmountInput}*/}
                        {/*    currency={currencies[Field.INPUT]}*/}
                        {/*    onUserInput={handleTypeInput}*/}
                        {/*    onMax={handleMaxInput}*/}
                        {/*    onCurrencySelect={handleInputSelect}*/}
                        {/*    otherCurrency={currencies[Field.OUTPUT]}*/}
                        {/*    id="swap-currency-input"*/}
                        {/*/>*/}
                        <CurrencyInputPanel
                            value={formattedAmounts[Field.OUTPUT]}
                            // onUserInput={handleTypeOutput}
                            label={
                               i18n._(t`Asset to move:`)
                            }
                            showMaxButton={!atMaxAmountOutput}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxInput}
                            currency={currencies[Field.OUTPUT]}
                            onCurrencySelect={handleOutputSelect}
                            id="swap-currency-output"
                        />

                        {recipient !== null && !showWrap ? (
                            <>
                                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                                    <ArrowWrapper clickable={false}>
                                        <ArrowDown size="16" color={theme.text2} />
                                    </ArrowWrapper>
                                    <LinkStyledButton
                                        id="remove-recipient-button"
                                        onClick={() => onChangeRecipient(null)}
                                    >
                                        - {i18n._(t`Remove bridge`)}
                                    </LinkStyledButton>
                                </AutoRow>
                                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                            </>
                        ) : null}
                    </AutoColumn>
                    <BottomGrouping>
                        {swapIsUnsupported ? (
                            <ButtonPrimary disabled={true}>
                                <TYPE.main mb="4px">{i18n._(t`Unsupported Asset`)}</TYPE.main>
                            </ButtonPrimary>
                        ) : !account ? (
                            <ButtonLight onClick={toggleWalletModal}>{i18n._(t`Connect Wallet`)}</ButtonLight>
                        ) : showWrap ? (
                            <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                                {wrapInputError ??
                                    (wrapType === WrapType.WRAP
                                        ? i18n._(t`Wrap`)
                                        : wrapType === WrapType.UNWRAP
                                        ? i18n._(t`Unwrap`)
                                        : null)}
                            </ButtonPrimary>
                        ) : userHasSpecifiedInputOutput && showApproveFlow ? (
                            <RowBetween>
                                <ButtonConfirmed
                                    onClick={approveCallback}
                                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                    width="48%"
                                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                                    confirmed={approval === ApprovalState.APPROVED}
                                >
                                    {approval === ApprovalState.PENDING ? (
                                        <AutoRow gap="6px" justify="center">
                                            Approving <Loader stroke="white" />
                                        </AutoRow>
                                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                        i18n._(t`Approved`)
                                    ) : (
                                        i18n._(t`Approve ${currencies[Field.OUTPUT]?.getSymbol(chainId)}`)
                                    )}
                                </ButtonConfirmed>
                                <ButtonError
                                    onClick={() => {
                                        setSwapState({
                                            currency: undefined,
                                            amount: undefined,
                                            attemptingTxn: false,
                                            swapErrorMessage: undefined,
                                            showConfirm: true,
                                            txHash: undefined
                                        })
                                    }}
                                    width="48%"
                                    id="swap-button"
                                    disabled={
                                        !isValid ||
                                        approval !== ApprovalState.APPROVED
                                    }
                                    error={isValid && priceImpactSeverity > 2}
                                >
                                    <Text fontSize={16} fontWeight={500}>
                                        {i18n._(t`Bridge`)}
                                    </Text>
                                </ButtonError>
                            </RowBetween>
                        ) : (
                            <ButtonError
                                onClick={() => {
                                setSwapState({
                                    currency: undefined,
                                    amount: undefined,
                                    attemptingTxn: false,
                                    swapErrorMessage: undefined,
                                    showConfirm: true,
                                    txHash: undefined
                                })

                                }}
                                id="swap-button"
                                disabled={!isValid || !!swapCallbackError}
                                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                            >
                                <Text fontSize={20} fontWeight={500}>
                                    { i18n._(t`Bridge`)}
                                </Text>
                            </ButtonError>
                        )}
                        {showApproveFlow && (
                            <Column style={{ marginTop: '1rem' }}>
                                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                            </Column>
                        )}
                        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                    </BottomGrouping>
                    {chainId && chainId === ChainId.BSC && (
                        <div
                            className="hidden sm:block w-full cursor-pointer pt-4"
                            onClick={() => toggleNetworkModal()}
                        >
                        </div>
                    )}
                </Wrapper>
            </div>
            {!swapIsUnsupported ? (
                <AdvancedSwapDetailsDropdown trade={undefined} />
            ) : (
                <UnsupportedCurrencyFooter
                    show={swapIsUnsupported}
                    currencies={[currencies.INPUT, currencies.OUTPUT]}
                />
            )}
        </>
    )
}
