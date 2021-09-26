import { exchange, masterchef } from 'apollo/client'
import { liquidityPositionSubsetQuery, pairSubsetQuery, poolsQuery, tokenSubsetQuery } from 'apollo/queries'
import { useCallback, useEffect, useState } from 'react'
import axios, {AxiosResponse} from 'axios';

import { BigNumber } from '@ethersproject/bignumber'
import Fraction from '../entities/Fraction'
import { getAverageBlockTime } from 'apollo/getAverageBlockTime'
import orderBy from 'lodash/orderBy'
import sushiData from 'hadeswap-beta-data'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useArgentWalletDetectorContract, useBridgeContract } from './useContract'
import useSWR from 'swr'
import { BRIDGE_SENT_QUERY, BRIDGE_ADDRESS, CHAIN_BRIDGES } from '../constants'
import { ChainId } from 'hadeswap-beta-sdk'
import { Provider } from '@ethersproject/abstract-provider'
import  { abi as BridgeForeignABI }  from '../constants/abis/bridge_foreign.json'
import  { abi as BridgeHomeABI }  from '../constants/abis/bridge_home.json'
import { ethers } from 'ethers'
import { useBlockNumber } from '../state/application/hooks'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../state'

const useAPI = () => {
    const [spent, setSpent] = useState<BigNumber  | undefined>()

    const blockNumber = useBlockNumber()

    const blockNumberState = !!blockNumber

    const { account, chainId } = useActiveWeb3React()
    // const dispatch = useDispatch<AppDispatch>()

    const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

    const transactions = chainId ? state[chainId] ?? {} : {}

    const getAPI = async () => {
        if(!blockNumber || !chainId || !account){
            return
        }

        const bridge = BRIDGE_ADDRESS[chainId]

        const inter = new ethers.utils.Interface(CHAIN_BRIDGES[chainId].isNative? BridgeForeignABI : BridgeHomeABI)

        const fromBlock =  blockNumber - BRIDGE_SENT_QUERY[chainId].blocksPerDay

        let query = ''
        // this implementation assumes that the api is either blockscout or etherscan
        // console.log(BRIDGE_SENT_QUERY[chain].query+`module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&topic0=${BRIDGE_SENT_QUERY[chain].topic}&address=${bridge}`)
        if(BRIDGE_SENT_QUERY[chainId].isBlockScout){
            query = BRIDGE_SENT_QUERY[chainId].query+`module=logs&action=getLogs&fromBlock=${fromBlock.toString()}&toBlock=latest&topic0=${BRIDGE_SENT_QUERY[chainId].topic}&address=${bridge}`
        }
        else {
            query = BRIDGE_SENT_QUERY[chainId].query+`module=logs&action=getLogs&fromBlock=${fromBlock.toString()}&toBlock=latest&address=${bridge}&topic0=${BRIDGE_SENT_QUERY[chainId].topic}`
            + (BRIDGE_SENT_QUERY[chainId].apiKey!==""?`&apikey=${BRIDGE_SENT_QUERY[chainId].apiKey}`: "")
        }

        let data
        try {
            data = await axios.get(query).then(res => {
                return res
            })
        } catch (e) {
            console.log(e)
        }

        let spentSum = BigNumber.from(0)

        if(data && data.data && data.data.result) {
            // console.log('DATA:', data)
            // TODO: This only works for logs of (addresss, amount)
            // Handle api limit
            if(data.data.status === '0' || data.data.message === 'NOTOK'){
                console.log("Max limit reached on API rate. Please refresh the page")
            }
            else if (data.data.result.length > 0 && Array.isArray(data.data.result)){

                const decodedLogs = data.data.result
                    .map((tx: any) => {
                        const decodedInput = inter.parseLog({ data: tx.data, topics: [BRIDGE_SENT_QUERY[chainId].topic]});
                        return decodedInput.args
                    })


                const userTxs = decodedLogs.filter((tx: any) => {
                    return(tx[0]===account)
                });
                // console.log("Filtered user logs:", userTxs)

                for(let i=0; i<userTxs.length; i++){
                    // console.log(userTxs[i].value)
                    spentSum = spentSum.add(userTxs[i].value??0)
                }

            }
        }
        setSpent(spentSum)
    }

    useEffect(() => {
        getAPI()
    }, [account, chainId, transactions, blockNumberState])

    return spent

}

export default useAPI
