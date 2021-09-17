import { MenuFlyout, StyledMenu, StyledMenuButton } from 'components/StyledMenu'
import React, { memo, useRef } from 'react'
import styled from 'styled-components'
import BscNet from '../../assets/networks/bsc-network.jpg'
import PolisNet from '../../assets/networks/polis.svg'

import { ChainId, Currency, CurrencyAmount, ETHER, JSBI, Token, Trade } from 'hadeswap-beta-sdk'
import {NETWORK_ICON, NETWORK_LABEL} from '../../constants/networks'
import {CHAIN_BRIDGES} from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { useLanguageData } from '../../language/hooks'

import { useLingui } from '@lingui/react'

const ExtendedStyledMenuButton = styled(StyledMenuButton)`
    border: 2px solid rgb(23, 21, 34);
    border-radius: 10px;
    font-size: 1.25rem;
    height: 40px;

    &:hover {
        border-color: rgb(33, 34, 49);
    }
`

const ExtendedMenuFlyout = styled(MenuFlyout)`
    min-width: 10rem;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    max-height: 232px;
    overflow: auto;
    min-width: 11rem;
    top: -16.5rem;
  `};
`

const MenuItem = styled.span`
    align-items: center;
    flex: 1;
    //display: flex;
    padding: 0.5rem 0.5rem;
    font-weight: 500;
    color: ${({ theme }) => theme.text2};
    :hover {
        color: ${({ theme }) => theme.text1};
        cursor: pointer;
        text-decoration: none;
    }
    > svg {
        margin-right: 8px;
    }
`

const MenuItemFlag = styled.img`
    display: inline;
    margin-right: 0.625rem;
    width: 20px;
    height: 20px;
    vertical-align: middle;
`

const MenuButtonFlag = styled.img`
    width: 22px;
    height: 22px;
    vertical-align: middle;
`
const NETS: { [x: string]: { flag: string; net: string; id: number} } = {
    bsc: {
        flag: BscNet,
        net: 'BSC',
        id: ChainId.BSC
    },
    polis: {
        flag: PolisNet,
        net: 'Sparta',
        id: ChainId.SPARTA
    },
    mumbai: {
        flag: PolisNet,
        net: 'Mumbai',
        id: ChainId.MUMBAI
    },
    mainnet: {
        flag: PolisNet,
        net: 'Mainnet',
        id: ChainId.MAINNET
    }
}

function NetworkSwitch() {
    const { i18n } = useLingui()

    const node = useRef<HTMLDivElement>(null)
    // TODO! Open selects the network
    const open = useModalOpen(ApplicationModal.NETWORK)
    const toggle = useToggleModal(ApplicationModal.NETWORK)
    useOnClickOutside(node, open ? toggle : undefined)
    const { language, setLanguage } = useLanguageData()
    
    const { account, chainId } = useActiveWeb3React()

    const onClick = (key: string) => {
        // TODO! Select network to bridge
        // setLanguage(key)
        toggle()
    }

    return (
        <StyledMenu ref={node}>
            <ExtendedStyledMenuButton onClick={toggle}>
                <MenuButtonFlag src={chainId?NETWORK_ICON[chainId]:''} alt={chainId?NETWORK_LABEL[chainId]:''}/>
                    {/* {chainId?NETWORK_LABEL[chainId]:''}  */}
                    {i18n._(`Set bridge to network -> `)}
                    {chainId?NETWORK_LABEL[CHAIN_BRIDGES[chainId].chain]:''}
            </ExtendedStyledMenuButton>
            {open && (
                <ExtendedMenuFlyout>
                    {Object.entries(NETS).map(([key, { flag, net, id }]) => (
                        <MenuItem onClick={() => onClick(key)} key={key}>
                            <MenuItemFlag src={flag} alt={net} />
                            {net}{' '}
                        </MenuItem>
                    ))}
                </ExtendedMenuFlyout>
            )}
        </StyledMenu>
    )
}

export default memo(NetworkSwitch)
