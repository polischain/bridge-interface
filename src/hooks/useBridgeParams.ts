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
import { BRIDGE_SENT_QUERY } from '../constants'
import useAPI from './useAPI'


const useBridgeParams = () => {
    const [params, setParams] = useState<{ dailyLimit: Fraction, minPerTx: Fraction, maxPerTx: Fraction, isInitialized: boolean, dailyAllowance:Fraction }  | undefined>()
    const { account, chainId } = useActiveWeb3React()
    const bridgeContract = useBridgeContract()
    const spent = useAPI()

    const fetchAllParams = useCallback(async () => {
        if(!bridgeContract ){
            return
        }
        // Some day we will use subgraph on this one


        // isInitialized
        // dailyLimit
        // maxPerTx
        // minPerTx

        // // estimate limit remaining for user
        // if(chainId) {
        //     const { data, error }: any = useSWR(BRIDGE_SENT_QUERY[chainId], url =>
        //         fetch(url).then(r => r.json())
        //     )
        //     if(error){
        //         console.log(error)
        //     }
        //     if(!data){
        //         console.log(error)
        //     }
        //     console.log(data)
        // }



        const isInitialized = await bridgeContract?.isInitialized()
        const dailyLimit: BigNumber = await bridgeContract?.dailyLimit()
        const maxPerTx = await bridgeContract?.maxPerTx()
        const minPerTx = await bridgeContract?.minPerTx()
        let dailySpent = BigNumber.from(0)

        // if(spent){
            dailySpent = dailyLimit.sub(spent??0)
        // }

        // console.log("WHYSAME", bridgeContract, dailyLimit, maxPerTx, minPerTx)


        setParams({
            isInitialized: isInitialized,
            dailyLimit: Fraction.from(dailyLimit, BigNumber.from(10).pow(18)),
            maxPerTx: Fraction.from(maxPerTx, BigNumber.from(10).pow(18)),
            minPerTx: Fraction.from(minPerTx, BigNumber.from(10).pow(18)),
            dailyAllowance: Fraction.from(dailySpent, BigNumber.from(10).pow(18))
        })

        // let limit =  Fraction.from(dailyLimit, BigNumber.from(10).pow(18)).toString(18)
        //
        // let min = Fraction.from(minPerTx, BigNumber.from(10).pow(18)).toString(18)
        //

        // } else {
        //     setFarms({ farms: sorted, userFarms: [] })
        // }
    }, [account, bridgeContract, spent])

    useEffect(() => {
        fetchAllParams()
    }, [spent, bridgeContract])

    return params
}

export default useBridgeParams
