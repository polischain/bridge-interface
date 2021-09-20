import { Currency, CurrencyAmount, currencyEquals, Trade } from 'hadeswap-beta-sdk'
import React, { useCallback, useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import TransactionConfirmationModal, {
    ConfirmationModalContent,
    TransactionErrorContent
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
    return (
        tradeA.tradeType !== tradeB.tradeType ||
        !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
        !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
        !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
        !tradeA.outputAmount.equalTo(tradeB.outputAmount)
    )
}

export default function ConfirmSwapModal({
    currency,
    amount,
    onAcceptChanges,
    allowedSlippage,
    onConfirm,
    onDismiss,
    recipient,
    swapErrorMessage,
    isOpen,
    attemptingTxn,
    txHash
}: {
    isOpen: boolean
    currency: Currency | undefined
    amount: CurrencyAmount | undefined
    attemptingTxn: boolean
    txHash: string | undefined
    recipient: string | null
    allowedSlippage: number
    onAcceptChanges: () => void
    onConfirm: () => void
    swapErrorMessage: string | undefined
    onDismiss: () => void
}) {
    const { chainId } = useActiveWeb3React()

    // TODO: Some kind of validation?
    const showAcceptChanges = useMemo(
        () => Boolean(currency && amount),
        [currency, amount]
    )

    const modalHeader = useCallback(() => {
        return currency && amount ? (
            <SwapModalHeader
                currency={currency}
                amount={amount}
                allowedSlippage={allowedSlippage}
                recipient={recipient}
                showAcceptChanges={false}
                onAcceptChanges={onAcceptChanges}
            />
        ) : null
    }, [allowedSlippage, onAcceptChanges, recipient, amount, currency])


    const modalBottom = useCallback(() => {
        return currency && amount ? (
            <SwapModalFooter
                onConfirm={onConfirm}
                currency={currency}
                amount={amount}
                disabledConfirm={!showAcceptChanges}
                swapErrorMessage={swapErrorMessage}
                allowedSlippage={allowedSlippage}
            />
        ) : null
    }, [allowedSlippage, onConfirm, swapErrorMessage, currency, amount])

    // text to show while loading
    const pendingText = `Moving through the bridge ${amount?.toSignificant(6)} ${currency?.getSymbol(
        chainId
    )} `

    const confirmationContent = useCallback(
        () =>
            swapErrorMessage ? (
                <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
            ) : (
                <ConfirmationModalContent
                    title="Confirm Bridge"
                    onDismiss={onDismiss}
                    topContent={modalHeader}
                    bottomContent={modalBottom}
                />
            ),
        [onDismiss, modalBottom, modalHeader, swapErrorMessage]
    )

    return (
        <TransactionConfirmationModal
            isOpen={isOpen}
            onDismiss={onDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={confirmationContent}
            pendingText={pendingText}
        />
    )
}
