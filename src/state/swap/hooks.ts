import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, POLIS, JSBI, Token, TokenAmount, Trade } from 'hadeswap-beta-sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { AppDispatch, AppState } from '../index'
import { useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SHOW_NATIVE } from '../../constants'

export function useSwapState(): AppState['swap'] {
    return useSelector<AppState, AppState['swap']>(state => state.swap)
}

export function useSwapActionHandlers(): {
    onCurrencySelection: (field: Field, currency: Currency) => void
    onSwitchTokens: () => void
    onUserInput: (field: Field, typedValue: string) => void
    onChangeRecipient: (recipient: string | null) => void
} {
    const dispatch = useDispatch<AppDispatch>()
    const onCurrencySelection = useCallback(
        (field: Field, currency: Currency) => {
            dispatch(
                selectCurrency({
                    field,
                    currencyId: currency instanceof Token ? currency.address : currency === POLIS ? 'ETH' : ''
                })
            )
        },
        [dispatch]
    )

    const onSwitchTokens = useCallback(() => {
        dispatch(switchCurrencies())
    }, [dispatch])

    const onUserInput = useCallback(
        (field: Field, typedValue: string) => {
            dispatch(typeInput({ field, typedValue }))
        },
        [dispatch]
    )

    const onChangeRecipient = useCallback(
        (recipient: string | null) => {
            dispatch(setRecipient({ recipient }))
        },
        [dispatch]
    )

    return {
        onSwitchTokens,
        onCurrencySelection,
        onUserInput,
        onChangeRecipient
    }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
    if (!value || !currency) {
        return undefined
    }
    try {
        const typedValueParsed = parseUnits(value, currency.decimals).toString()
        if (typedValueParsed !== '0') {
            return currency instanceof Token
                ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
                : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
        }
    } catch (error) {
        // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
        console.debug(`Failed to parse input amount: "${value}"`, error)
    }
    // necessary for all paths to return a value
    return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
    '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
    return (
        trade.route.path.some(token => token.address === checksummedAddress) ||
        trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
    )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
    currencies: { [field in Field]?: Currency }
    currencyBalances: { [field in Field]?: CurrencyAmount }
    parsedAmount: CurrencyAmount | undefined
    v2Trade: Trade | undefined
    inputError?: string
} {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()

    let {
        independentField,
        typedValue,
        [Field.INPUT]: { currencyId: inputCurrencyId },
        [Field.OUTPUT]: { currencyId: outputCurrencyId },
        recipient
    } = useSwapState()

    // console.log('SWAP STATE: ', independentField, typedValue, recipient)

    const inputCurrency = useCurrency(inputCurrencyId)
    // If the chain is native, then force the native coin only
    const showETH = chainId?SHOW_NATIVE[chainId]:false
    if (showETH) {
        outputCurrencyId = 'ETH'
    }
    const outputCurrency = useCurrency(outputCurrencyId)


    const recipientLookup = useENS(recipient ?? undefined)
    const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

    const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
        inputCurrency ?? undefined,
        outputCurrency ?? undefined
    ])

    const isExactIn: boolean = independentField === Field.INPUT
    const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

    // const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
    // const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)
    //
    // const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

    const currencyBalances = {
        [Field.INPUT]: relevantTokenBalances[0],
        [Field.OUTPUT]: relevantTokenBalances[1]
    }

    const currencies: { [field in Field]?: Currency } = {
        [Field.INPUT]: inputCurrency ?? undefined,
        [Field.OUTPUT]: outputCurrency ?? undefined
    }

    let inputError: string | undefined
    if (!account) {
        inputError = 'Connect Wallet'
    }

    if (!parsedAmount) {
        inputError = inputError ?? i18n._(t`Enter an amount`)
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
        inputError = inputError ?? i18n._(t`Select a token`)
    }

    const formattedTo = isAddress(to)

    // if (!to || !formattedTo) {
    //     inputError = inputError ?? i18n._(t`Enter a recipient`)
    // } else {
    //     if (
    //         BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
    //         (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
    //         (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    //     ) {
    //         inputError = inputError ?? i18n._(t`Invalid recipient`)
    //     }
    // }

    const [allowedSlippage] = useUserSlippageTolerance()

    const slippageAdjustedAmounts = parsedAmount

    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [
        currencyBalances[Field.OUTPUT],
        parsedAmount ? parsedAmount : null
    ]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
        inputError = i18n._(t`Insufficient ${amountIn.currency.getSymbol(chainId)} balance`)
    }

    // console.log("input error: ", inputError)

    return {
        currencies,
        currencyBalances,
        parsedAmount,
        v2Trade: undefined,
        inputError
    }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
    if (typeof urlParam === 'string') {
        const valid = isAddress(urlParam)
        if (valid) return valid
        if (urlParam.toUpperCase() === 'ETH') return 'ETH'
        if (valid === false) return 'ETH'
    }
    return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
    return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
    return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
    if (typeof recipient !== 'string') return null
    const address = isAddress(recipient)
    if (address) return address
    if (ENS_NAME_REGEX.test(recipient)) return recipient
    if (ADDRESS_REGEX.test(recipient)) return recipient
    return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
    let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
    let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
    if (inputCurrency === outputCurrency) {
        if (typeof parsedQs.outputCurrency === 'string') {
            inputCurrency = ''
        } else {
            outputCurrency = ''
        }
    }

    const recipient = validatedRecipient(parsedQs.recipient)

    return {
        [Field.INPUT]: {
            currencyId: inputCurrency
        },
        [Field.OUTPUT]: {
            currencyId: outputCurrency
        },
        typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
        independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
        recipient
    }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
    | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
    | undefined {
    const { chainId } = useActiveWeb3React()
    const dispatch = useDispatch<AppDispatch>()
    const parsedQs = useParsedQueryString()
    const [result, setResult] = useState<
        { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
    >()

    useEffect(() => {
        if (!chainId) return
        const parsed = queryParametersToSwapState(parsedQs)

        dispatch(
            replaceSwapState({
                typedValue: parsed.typedValue,
                field: parsed.independentField,
                inputCurrencyId: parsed[Field.INPUT].currencyId,
                outputCurrencyId: parsed[Field.OUTPUT].currencyId,
                recipient: parsed.recipient
            })
        )

        setResult({
            inputCurrencyId: parsed[Field.INPUT].currencyId,
            outputCurrencyId: parsed[Field.OUTPUT].currencyId
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, chainId])

    return result
}
