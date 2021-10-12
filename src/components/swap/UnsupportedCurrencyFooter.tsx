import { Currency, Token } from 'hadeswap-beta-sdk'
import { ButtonEmpty } from 'components/ButtonLegacy'
import Card, { OutlineCard } from 'components/CardLegacy'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import Modal from 'components/Modal'
import { AutoRow, RowBetween } from 'components/Row'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import React, { useState } from 'react'
import styled from 'styled-components'
import { CloseIcon, ExternalLink, TYPE } from 'theme'
import { getExplorerLink } from 'utils'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useUnsupportedTokens } from '../../hooks/Tokens'
import useBridgeParams from '../../hooks/useBridgeParams'
import useAPI from '../../hooks/useAPI'


const DetailsFooter = styled.div<{ show: boolean }>`
    padding-top: calc(16px + 2rem);
    padding-bottom: 20px;
    margin-top: -2rem;
    width: 100%;
    //max-width: 400px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    color: ${({ theme }) => theme.text2};
    background-color: ${({ theme }) => theme.advancedBG};
    z-index: -1;

    transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
    transition: transform 300ms ease-in-out;
    text-align: center;
`

const AddressText = styled(TYPE.blue)`
    font-size: 12px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

export default function UnsupportedCurrencyFooter({
    show,
    currencies
}: {
    show: boolean
    currencies: (Currency | undefined)
}) {
    const [showDetails, setShowDetails] = useState(false)
    const params = useBridgeParams()
    const spent = useAPI()

    return (
        <DetailsFooter show={show}>
            <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
                <Card padding="2rem">
                    <AutoColumn gap="lg">
                        <RowBetween>
                            <TYPE.mediumHeader>Invalid Amount</TYPE.mediumHeader>

                            <CloseIcon onClick={() => setShowDetails(false)} />
                        </RowBetween>
                        <AutoColumn gap="lg">
                            <TYPE.body fontWeight={500}>
                                Your amount may not be between the Min or Max parameters from the bridge
                            </TYPE.body>
                        </AutoColumn>
                        {
                            params && (
                                <OutlineCard >
                                    <AutoColumn gap="10px">
                                        <AutoRow gap="5px" align="center">
                                            <TYPE.body fontWeight={500}>{`Min amount per transfer: ${params.minPerTx.toString(18)} ${currencies?.symbol}`}</TYPE.body>
                                        </AutoRow>
                                        <AutoRow gap="5px" align="center">
                                            <TYPE.body fontWeight={500}>{`Max amount per transfer: ${params.maxPerTx.toString(18)} ${currencies?.symbol}`}</TYPE.body>
                                        </AutoRow>
                                        {
                                            spent ? (
                                                <AutoRow gap="5px" align="center">
                                                    <TYPE.body fontWeight={500}>{`Current daily amount remaining: ${params.dailyAllowance.toString(18)} ${currencies?.symbol}`}</TYPE.body>
                                                </AutoRow>
                                            ) : (
                                                <AutoRow gap="5px" align="center">
                                                    <TYPE.body fontWeight={500}>{`Daily limit: ${params.dailyLimit.toString(18)} ${currencies?.symbol}`}</TYPE.body>
                                                </AutoRow>
                                            )
                                        }
                                    </AutoColumn>
                                </OutlineCard>
                            )
                        }
                    </AutoColumn>
                </Card>
            </Modal>
            <ButtonEmpty  padding={'0'} onClick={() => setShowDetails(true)}>
                <TYPE.blue>Read more about this error</TYPE.blue>
            </ButtonEmpty>
        </DetailsFooter>
    )
}
