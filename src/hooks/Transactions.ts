import { ChainId, Currency, CurrencyAmount, JSBI, Pair, Token, Trade } from 'hadeswap-beta-sdk'
import { useMemo } from 'react'
import { useUserSingleHopOnly } from 'state/user/hooks'
import { isTradeBetter } from 'utils/trades'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import useSWR from 'swr'
import  { abi as BridgeForeignABI }  from '../constants/abis/bridge_foreign.json'
import  { abi as BridgeHomeABI }  from '../constants/abis/bridge_home.json'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useUnsupportedTokens } from './Tokens'
import { BigNumber, ethers } from 'ethers'
import useBridgeParams from '../hooks/useBridgeParams'
import Fraction from '../entities/Fraction'
import { BRIDGE_ADDRESS, BRIDGE_SENT_QUERY, CHAIN_BRIDGES } from '../constants'
import { Provider } from '@ethersproject/abstract-provider'


export function useIsTransactionUnsupported(amountIn?: CurrencyAmount): { daily: boolean; min: boolean; max: boolean } {
    const unsupportedToken: { [address: string]: Token } = useUnsupportedTokens()
    const { chainId } = useActiveWeb3React()
    const params = useBridgeParams()

    if(!amountIn || !params) {
        return { daily: true, min: true, max: true }
    }

    let result
    // Daily check
    let unsupportedDaily = false

    // Min check
    let unsupportedMin
    unsupportedMin = JSBI.greaterThanOrEqual(amountIn.raw, JSBI.BigInt(params.minPerTx.numerator))


    // Max check
    let unsupportedMax
    unsupportedMax = JSBI.lessThanOrEqual(amountIn.raw, JSBI.BigInt(params.maxPerTx.numerator))


    return { daily: unsupportedDaily, min: !unsupportedMin, max: !unsupportedMax }
}

export function FetchUserTransactions(chainId: ChainId, account:string, provider: Provider, blockNumber: number) {
    // estimate limit remaining for user
    const bridge = BRIDGE_ADDRESS[chainId]

    const inter = new ethers.utils.Interface(BridgeHomeABI);

    const fromBlock = blockNumber - BRIDGE_SENT_QUERY[chainId].blocksPerDay

    let query = ''
    // this implementation assumes that the api is either blockscout or etherscan
    // console.log(BRIDGE_SENT_QUERY[chainId].query+`module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&topic0=${BRIDGE_SENT_QUERY[chainId].topic}&address=${bridge}`)
    if(BRIDGE_SENT_QUERY[chainId].isBlockScout){
        query = BRIDGE_SENT_QUERY[chainId].query+`module=logs&action=getLogs&fromBlock=${fromBlock.toString()}&toBlock=latest&topic0=${BRIDGE_SENT_QUERY[chainId].topic}&address=${bridge}`
    }
    else {
        query = '' + BRIDGE_SENT_QUERY[chainId].apiKey ?? ''
    }

    const { data, error }: any = useSWR(query, url =>
        fetch(url).then(r => r.json())
    )
    if(error){
        console.log(error)
    }
    console.log(data)
    if (data){

        const pairAddresses = data.result
            .map((tx: any) => {
                const decodedInput = inter.parseLog({ data: tx.data, topics: [BRIDGE_SENT_QUERY[chainId].topic]});
                console.log(decodedInput)
                return decodedInput.args
            })

        console.log(pairAddresses)

        // const tokens = data.result
        //     .filter((tx: any) => {
        //         return !(
        //             // !POOL_DENY.includes(pool?.id) &&
        //             pairs.find((pair: any) => pair?.id === account)
        //         )
        //     })
        const decodedInput = inter.parseLog({ data: data.result[0].data, topics: [BRIDGE_SENT_QUERY[chainId].topic]});
        console.log(decodedInput)

    }

}
