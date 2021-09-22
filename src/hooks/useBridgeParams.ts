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

const useBridgeParams = () => {
    const [params, setParams] = useState<any | undefined>()
    const { account } = useActiveWeb3React()
    const bridgeContract = useBridgeContract()

    const fetchAllParams = useCallback(async () => {
        // Some day we will use subgraph on this one


        // isInitialized
        // dailyLimit
        // maxPerTx
        // minPerTx


        const isInitialized = await bridgeContract?.isInitialized()
        const dailyLimit = await bridgeContract?.dailyLimit()
        const maxPerTx = await bridgeContract?.maxPerTx()
        const minPerTx = await bridgeContract?.minPerTx()


        setParams({ isInitialized: isInitialized, dailyLimit: dailyLimit , maxPerTx: maxPerTx, minPerTx: minPerTx})

        let limit =  Fraction.from(dailyLimit, BigNumber.from(10).pow(18)).toString(18)

        let min = Fraction.from(minPerTx, BigNumber.from(10).pow(18)).toString(18)

        console.log('PARAms:', isInitialized, limit, maxPerTx, min)

        // } else {
        //     setFarms({ farms: sorted, userFarms: [] })
        // }
    }, [account, bridgeContract])

    useEffect(() => {
        fetchAllParams()
    }, [fetchAllParams])

    return params
}

export default useBridgeParams
