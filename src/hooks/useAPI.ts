import { exchange, masterchef } from 'apollo/client'
import { liquidityPositionSubsetQuery, pairSubsetQuery, poolsQuery, tokenSubsetQuery } from 'apollo/queries'
import { useCallback, useEffect, useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import Fraction from '../entities/Fraction'
import { getAverageBlockTime } from 'apollo/getAverageBlockTime'
import orderBy from 'lodash/orderBy'
import sushiData from 'hadeswap-beta-data'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useBridgeContract } from './useContract'
import useSWR from 'swr'
import { BRIDGE_SENT_QUERY, BRIDGE_ADDRESS } from '../constants'
import { ChainId } from 'hadeswap-beta-sdk'
import { Provider } from '@ethersproject/abstract-provider'
import  { abi as BridgeForeignABI }  from '../constants/abis/bridge_foreign.json'
import  { abi as BridgeHomeABI }  from '../constants/abis/bridge_home.json'
import { ethers } from 'ethers'
import { useBlockNumber } from '../state/application/hooks'

const useAPI = () => {
    const [spent, setSpent] = useState<Fraction  | undefined>()

    const blockNumber = useBlockNumber()
    const { account, chainId, library } = useActiveWeb3React()

    const chain = chainId??333888
    // estimate limit remaining for user
    const bridge = BRIDGE_ADDRESS[chain]

    const inter = new ethers.utils.Interface(BridgeHomeABI);

    console.log('BLOCKblockNumber', blockNumber)

    const fromBlock = blockNumber? blockNumber - BRIDGE_SENT_QUERY[chain].blocksPerDay : 0

    let query = ''
    // this implementation assumes that the api is either blockscout or etherscan
    console.log(BRIDGE_SENT_QUERY[chain].query+`module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&topic0=${BRIDGE_SENT_QUERY[chain].topic}&address=${bridge}`)
    if(BRIDGE_SENT_QUERY[chain].isBlockScout){
        query = BRIDGE_SENT_QUERY[chain].query+`module=logs&action=getLogs&fromBlock=${fromBlock.toString()}&toBlock=latest&topic0=${BRIDGE_SENT_QUERY[chain].topic}&address=${bridge}`
    }
    else {
        query = '' + BRIDGE_SENT_QUERY[chain].apiKey ?? ''
    }

    const { data, error }: any = useSWR(query, url =>
        fetch(url).then(r => r.json())
    )
    if(error){
        console.log(error)
    }
    let spentSum = BigNumber.from(0)
    console.log(data)
    // TODO: This only works for logs of (addresss, amount)
    if (data && data.result && data.result.length > 0){

        const pairAddresses = data.result
            .map((tx: any) => {
                const decodedInput = inter.parseLog({ data: tx.data, topics: [BRIDGE_SENT_QUERY[chain].topic]});
                console.log(decodedInput)
                return decodedInput.args
            })

        console.log(pairAddresses)

        const userTxs = pairAddresses.filter((tx: any) => {
            return(tx[0]===account)
        });
        console.log("!!!!FILTERESD", userTxs)

        for(let i=0; i<userTxs.length; i++){
            console.log(userTxs[i].value)
            spentSum = spentSum.add(userTxs[i].value??0)
        }

        // const tokens = data.result
        //     .filter((tx: any) => {
        //         return !(
        //             // !POOL_DENY.includes(pool?.id) &&
        //             pairs.find((pair: any) => pair?.id === account)
        //         )
        //     })
        // const decodedInput = inter.parseLog({ data: data.result[0].data, topics: [BRIDGE_SENT_QUERY[chain].topic]});
        // console.log(decodedInput)
        console.log(spentSum.toString())
        setSpent(Fraction.from(spentSum, BigNumber.from(10).pow(18)))


    }


    return spent

}

export default useAPI
