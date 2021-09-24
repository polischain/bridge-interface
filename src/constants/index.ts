import { JSBI, Percent, Token, ChainId, WETH } from 'hadeswap-beta-sdk'
import { injected, walletconnect } from '../connectors'

import { AbstractConnector } from '@web3-react/abstract-connector'


export const BORING_HELPER_ADDRESS = {
    [ChainId.MAINNET]: '0x11Ca5375AdAfd6205E41131A4409f182677996E6',
    [ChainId.SPARTA]: '0x0A8aAC4F84277775bAA9fE6be58fE402B97b847a',
    [ChainId.BSC]: '0x11Ca5375AdAfd6205E41131A4409f182677996E6',
    [ChainId.MUMBAI]: '0xC614405267eCDbF01FB5b425e3F2EC657160101A'

}

export const BRIDGE_ADDRESS = {
    [ChainId.MAINNET]: '',
    [ChainId.SPARTA]: '0x74bBBd046627CE60148197ab836D011c7Cec4D69',
    [ChainId.BSC]: '',
    [ChainId.MUMBAI]: '0x1ED9cA7E442a91591AcecFb2D40e843e4FEE00ff'

}

export const BRIDGE_SENT_QUERY = {
    [ChainId.MAINNET]: { query:'https://explorer.polis.tech/api?',
        topic: '0x127650bcfb0ba017401abe4931453a405140a8fd36fece67bae2db174d3fdd63', isBlockScout: true, apiKey:"", blocksPerDay: 0},
    [ChainId.SPARTA]: { query:'https://sparta-explorer.polis.tech/api?',
                        topic: '0x127650bcfb0ba017401abe4931453a405140a8fd36fece67bae2db174d3fdd63', isBlockScout: true, apiKey:"", blocksPerDay: 10800},
    [ChainId.BSC]: { query:'https://api.bscscan.com/api?',
        topic: '0x1d491a427d1f8cc0d447496f300fac39f7306122481d8e663451eb268274146b', isBlockScout: false, apiKey:process.env.REACT_APP_BSCSCAN_API_KEY, blocksPerDay: 0},
    [ChainId.MUMBAI]: { query:'https://api-testnet.polygonscan.com/api?',
        topic: '0x1d491a427d1f8cc0d447496f300fac39f7306122481d8e663451eb268274146b', isBlockScout: false, apiKey:process.env.REACT_APP_POLYGONSCAN_API_KEY, blocksPerDay: 40000},

}


// Given the selected chainId, returns the other-side-of-the-bridge chainID and if the other side is the native or the foreign
export const CHAIN_BRIDGES = {
    [ChainId.MUMBAI]: { chain: ChainId.SPARTA, isNative: true },
    [ChainId.SPARTA]: { chain: ChainId.MUMBAI, isNative: false},
    [ChainId.BSC]: { chain: ChainId.MAINNET, isNative: true},
    [ChainId.MAINNET]: { chain: ChainId.BSC, isNative: false},

}

// Should a currency list show the native coin as option
export const SHOW_NATIVE = {
    [ChainId.MAINNET]: true,
    [ChainId.SPARTA]: true,
    [ChainId.BSC]:false,
    [ChainId.MUMBAI]: false,
}

// a list of tokens by chain
type ChainTokenList = {
    readonly [chainId in ChainId]: Token[]
}

type ChainTokenMap = {
    readonly [chainId in ChainId]?: Token
}

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS


// TODO: SDK should have two maps, WETH map and WNATIVE map.
const WRAPPED_NATIVE_ONLY: ChainTokenList = {
    [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
    [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
    [ChainId.BSC]: [WETH[ChainId.BSC]],
    [ChainId.SPARTA]: [WETH[ChainId.SPARTA]]
}


// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
    ...WRAPPED_NATIVE_ONLY,
    [ChainId.MAINNET]: [...WRAPPED_NATIVE_ONLY[ChainId.MAINNET]],

}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
    ...WRAPPED_NATIVE_ONLY,
    [ChainId.MAINNET]: [...WRAPPED_NATIVE_ONLY[ChainId.MAINNET]],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {

}

export interface WalletInfo {
    connector?: AbstractConnector
    name: string
    iconName: string
    description: string
    href: string | null
    color: string
    primary?: true
    mobile?: true
    mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
    INJECTED: {
        connector: injected,
        name: 'Injected',
        iconName: 'arrow-right.svg',
        description: 'Injected web3 provider.',
        href: null,
        color: '#010101',
        primary: true
    },
    METAMASK: {
        connector: injected,
        name: 'MetaMask',
        iconName: 'metamask.png',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D'
    },
    WALLET_CONNECT: {
        connector: walletconnect,
        name: 'WalletConnect',
        iconName: 'walletConnectIcon.svg',
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#4196FC',
        mobile: true
    },
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [

]

export const ANALYTICS_URL: { [chainId in ChainId]?: string } = {
    [ChainId.SPARTA]: 'https://analytics.hadeswap.finance/',
}


// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
    [ChainId.MAINNET]: '0xcBE6B83e77cdc011Cc18F6f0Df8444E5783ed982',
    // [ChainId.ROPSTEN]: '0x84d1f7202e0e7dac211617017ca72a2cb5e2b955'
}