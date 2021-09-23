import { MenuFlyout, StyledMenu, StyledMenuButton } from 'components/StyledMenu'
import React, { memo, useRef } from 'react'
import styled from 'styled-components'
import BscNet from '../../assets/networks/bsc-network.jpg'
import PolisNet from '../../assets/networks/polis.svg'
import MumbaiNet from '../../assets/networks/polis.svg'
import MainNet from '../../assets/networks/polis.svg'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { ChainId } from 'hadeswap-beta-sdk'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { CHAIN_BRIDGES } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'

import { useLingui } from '@lingui/react'


export const PARAMS: {
    [chainId in ChainId]?: {
        chainId: string
        chainName: string
        nativeCurrency: {
            name: string
            symbol: string
            decimals: number
        }
        rpcUrls: string[]
        blockExplorerUrls: string[]
    }
} = {
    [ChainId.SPARTA]: {
        chainId: '0x51840',
        chainName: 'Polis',
        nativeCurrency: {
            name: 'Polis Token',
            symbol: 'POLIS',
            decimals: 18
        },
        rpcUrls: ['https://sparta-rpc.polis.tech'],
        blockExplorerUrls: ['https://sparta-explorer.polis.tech']
    },
    [ChainId.BSC]: {
        chainId: '0x38',
        chainName: 'BSC',
        nativeCurrency: {
            name: 'WBNB',
            symbol: 'WBNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
    },
    [ChainId.MAINNET]: {
        chainId: '0x518AF',
        chainName: 'Olympus',
        nativeCurrency: {
            name: 'Polis',
            symbol: 'POLIS',
            decimals: 18
        },
        rpcUrls: ['https://rpc.polis.tech'],
        blockExplorerUrls: ['https://explorer.polis.tech']
    },
    [ChainId.MUMBAI]: {
        chainId: '0x13881',
        chainName: 'Mumbai',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://rpc.maticvigil.com/'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com']
    }

}

export const ExtendedStyledMenuButton = styled(StyledMenuButton)`
    display: inline;
    border: 2px solid rgb(23, 21, 34);
    font-size: 1.25rem;
    //width: auto;
    height: 7rem;
    padding: 0;
    align:left;
    text-align: left;
    &:hover {
        border-color: rgb(33, 34, 49);
    }
`

export const ExtendedMenuFlyout = styled(MenuFlyout)`
    min-width: 10rem;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    max-height: 232px;
    overflow: auto;
    min-width: 11rem;
    top: -16.5rem;
  `};
`

export const MenuItem = styled.span`
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

export const MenuItemLogo = styled.img`
    display: inline;
    margin-right: 0.625rem;
    width: 20px;
    height: 20px;
`

export const MenuButtonLogo = styled.img`
    display: inline;
    width: 5rem;
    height: 5rem;
    padding: 1rem 1rem;
`

export const MenuText = styled.span`
    display: inline;
`


export const NETS: { [x: string]: { logo: string; net: string; id: ChainId } } = {
    bsc: {
        logo: BscNet,
        net: 'BSC',
        id: ChainId.BSC
    },
    polis: {
        logo: PolisNet,
        net: 'Sparta',
        id: ChainId.SPARTA
    },
    mumbai: {
        logo: MumbaiNet,
        net: 'Mumbai',
        id: ChainId.MUMBAI
    },
    mainnet: {
        logo: MainNet,
        net: 'Mainnet',
        id: ChainId.MAINNET
    }
}

export const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
    margin: 0 0.25rem 0 0.5rem;
    height: 35%;

    path {
        stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
        stroke-width: 1.5px;
    }
`

function NetworkSwitch() {
    const { i18n } = useLingui()

    const node = useRef<HTMLDivElement>(null)
    const open = useModalOpen(ApplicationModal.BRIDGE)
    const toggle = useToggleModal(ApplicationModal.BRIDGE)
    useOnClickOutside(node, open ? toggle : undefined)

    const { account, library, chainId } = useActiveWeb3React()

    const onClick = (key: ChainId) => {
        const params = PARAMS[key]
        library?.send('wallet_addEthereumChain', [params, account])
        toggle()
    }

    return (
        <StyledMenu ref={node}>
            <ExtendedStyledMenuButton onClick={toggle}>

                <div className="flex items-center">
                    <MenuButtonLogo src={chainId ? NETWORK_ICON[chainId] : ''} alt={chainId ? NETWORK_LABEL[chainId] : ''} />
                    <MenuText>
                        {chainId ? NETWORK_LABEL[chainId] : ''}
                    </MenuText>
                    <StyledDropDown selected={!open} />
                </div>
            </ExtendedStyledMenuButton>
            {open && (
                <ExtendedMenuFlyout>
                    {Object.entries(NETS).map(([key, { logo, net, id }]) => (
                        <MenuItem onClick={() => onClick(id)} key={key}>
                            <MenuItemLogo src={logo} alt={net} />
                            {net}{' '}
                        </MenuItem>
                    ))}
                </ExtendedMenuFlyout>
            )}
        </StyledMenu>
    )
}

export default memo(NetworkSwitch)
