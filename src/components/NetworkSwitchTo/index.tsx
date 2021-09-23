import { MenuFlyout, StyledMenu, StyledMenuButton } from 'components/StyledMenu'
import React, { memo, useRef } from 'react'
import styled from 'styled-components'
import BscNet from '../../assets/networks/bsc-network.jpg'
import PolisNet from '../../assets/networks/polis.svg'
import MumbaiNet from '../../assets/networks/polis.svg'
import MainNet from '../../assets/networks/polis.svg'

import { ChainId } from 'hadeswap-beta-sdk'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { CHAIN_BRIDGES } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'

import { useLingui } from '@lingui/react'

import { PARAMS, NETS, ExtendedStyledMenuButton, ExtendedMenuFlyout, MenuItem, MenuItemLogo, MenuButtonLogo, MenuText, StyledDropDown } from '../../components/NetworkSwitch'

function NetworkSwitchTo() {
    const { i18n } = useLingui()

    const node = useRef<HTMLDivElement>(null)
    const open = useModalOpen(ApplicationModal.BRIDGE_TO)
    const toggle = useToggleModal(ApplicationModal.BRIDGE_TO)
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
                    <MenuButtonLogo src={chainId ? NETWORK_ICON[CHAIN_BRIDGES[chainId].chain] : ''} alt={chainId ? NETWORK_LABEL[chainId] : ''} />
                    <MenuText>

                        {/* {i18n._(`Set bridge to network -> `)} */}
                        {chainId ? NETWORK_LABEL[CHAIN_BRIDGES[chainId].chain] : ''}
                    </MenuText>
                    <StyledDropDown selected={!open} />
                </div>
            </ExtendedStyledMenuButton>
            {open && (
                <ExtendedMenuFlyout>
                    {Object.entries(NETS).map(([key, { logo, net, id }]) => (
                        <MenuItem onClick={() => onClick(CHAIN_BRIDGES[id].chain)} key={key}>
                            <MenuItemLogo src={logo} alt={net} />
                            {net}{' '}
                        </MenuItem>
                    ))}
                </ExtendedMenuFlyout>
            )}
        </StyledMenu>
    )
}

export default memo(NetworkSwitchTo)
