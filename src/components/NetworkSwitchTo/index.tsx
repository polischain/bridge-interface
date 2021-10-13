import "dotenv/config"
import { StyledMenu } from 'components/StyledMenu'
import React, { memo, useRef, useState, useEffect } from 'react'


import { ChainId } from 'hadeswap-beta-sdk'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { CHAIN_BRIDGES } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import Fraction from '../../entities/Fraction'

import { PARAMS, API_PARAMS, LOGOS, ExtendedStyledMenuButton, ExtendedMenuFlyout } from '../../components/NetworkSwitch'
import { MenuItem, MenuItemLogo, MenuButtonLogo, MenuText, StyledDropDown, } from '../../components/NetworkSwitch'
import { BigNumber } from '@ethersproject/bignumber'

interface ForeignBalanceProps {
    url_to_fetch?: RequestInfo | null
    token?: string | null
}

function ForeignBalance({
    url_to_fetch,
    token
}: ForeignBalanceProps) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [foreignBalance, setForeignBalance] = useState(null);
    const { account, chainId } = useActiveWeb3React()


    useEffect(() => {
        fetch(url_to_fetch ? url_to_fetch : '')
            .then(response => response.json())
            .then(data => {
                setIsLoaded(true);
                setForeignBalance(data.result)
            },
                (error) => {
                    setIsLoaded(false);
                    setError(error);
                });

    }, [chainId, account]);


    if (isLoaded){
        // console.log('Foreign balance')
        // console.log(foreignBalance)
        return (
            <div style={{ width: '100%' }} >
                <span className="balance-span" >Balance: {Fraction.from(BigNumber.from(foreignBalance ? foreignBalance : 0), BigNumber.from(10).pow(18)).toString(18)} {token}</span>
            </div>
        )
    } else if (error) {
        // console.log('Error:')
        // console.log(url_to_fetch)
        // console.log(error)
        return (<span className="balance-span" >Balance: Could not fetch data </span>);
    } else{
        return (<span className="balance-span" >Loading... </span>);
    }
}

function NetworkSwitchTo() {

    const node = useRef<HTMLDivElement>(null)
    const open = useModalOpen(ApplicationModal.BRIDGE_TO)
    const toggle = useToggleModal(ApplicationModal.BRIDGE_TO)
    useOnClickOutside(node, open ? toggle : undefined)

    const { account, library, chainId } = useActiveWeb3React()

    const onClick = () => {
        const params = PARAMS[CHAIN_BRIDGES[chainId!].chain]
        library?.send('wallet_addEthereumChain', [params, account])
        toggle()
    }

    return (
        <StyledMenu ref={node}>
            <ExtendedStyledMenuButton onClick={toggle}>
                <div className="flex items-center">
                    <MenuButtonLogo src={chainId ? NETWORK_ICON[CHAIN_BRIDGES[chainId].chain] : ''} alt={chainId ? NETWORK_LABEL[chainId] : ''} />
                    <MenuText>
                        {chainId ? NETWORK_LABEL[CHAIN_BRIDGES[chainId].chain] : ''}
                    </MenuText>
                    <StyledDropDown selected={!open} />
                </div>
                <ForeignBalance url_to_fetch={chainId && account ? (chainId ? API_PARAMS[CHAIN_BRIDGES[chainId].chain]?.apiUrl : '') + account + (API_PARAMS[CHAIN_BRIDGES[chainId].chain]?.apiKey ? (API_PARAMS[CHAIN_BRIDGES[chainId].chain]?.apiKeyUrl) : '') : ''}
                                token={chainId ? ( CHAIN_BRIDGES[chainId].isNative?  PARAMS[CHAIN_BRIDGES[chainId].chain]?.nativeCurrency.symbol : CHAIN_BRIDGES[chainId].symbol)  : ''} />

            </ExtendedStyledMenuButton>
            {open && (
                <ExtendedMenuFlyout>
                    <MenuItem onClick={onClick}>
                        <MenuItemLogo src={LOGOS[chainId!].logo} alt={NETWORK_LABEL[chainId!]} />
                        {NETWORK_LABEL[chainId!]}{' '}
                    </MenuItem>
                </ExtendedMenuFlyout>
            )}
        </StyledMenu>
    )
}

export default memo(NetworkSwitchTo)
