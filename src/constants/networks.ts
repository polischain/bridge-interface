import { ChainId } from 'hadeswap-beta-sdk'
import Polis from '../assets/networks/polis.svg'
import Bsc from '../assets/networks/bsc-network.jpg'


export const NETWORK_ICON = {
    [ChainId.MAINNET]: Polis,
    [ChainId.SPARTA]: Polis,
    [ChainId.BSC]: Bsc,
    [ChainId.MUMBAI]: Polis

}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
    [ChainId.MAINNET]: 'Olympus',
    [ChainId.SPARTA]: 'Sparta (testnet)',
    [ChainId.BSC]: 'Binance Smart Chain',
    [ChainId.MUMBAI]: 'Polygon testnet'
}
