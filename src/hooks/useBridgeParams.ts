import { exchange, masterchef } from 'apollo/client'
import { liquidityPositionSubsetQuery, pairSubsetQuery, poolsQuery, tokenSubsetQuery } from 'apollo/queries'
import { useCallback, useEffect, useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import Fraction from '../entities/Fraction'
import { getAverageBlockTime } from 'apollo/getAverageBlockTime'
import orderBy from 'lodash/orderBy'
import useAPI from './useAPI'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useBridgeContract } from './useContract'

const useBridgeParams = () => {
    const [params, setParams] = useState<{ dailyLimit: Fraction, minPerTx: Fraction, maxPerTx: Fraction, isInitialized: boolean, dailyAllowance:Fraction }  | undefined>()
    const { account } = useActiveWeb3React()
    const bridgeContract = useBridgeContract()
    const spent = useAPI()

    const fetchAllParams = useCallback(async () => {

        if(!bridgeContract){
            return
        }
        // Some day we will use subgraph on this one


        // isInitialized
        // dailyLimit
        // maxPerTx
        // minPerTx


        const isInitialized = await bridgeContract?.isInitialized()
        const dailyLimit: BigNumber = await bridgeContract?.dailyLimit()
        const maxPerTx = await bridgeContract?.maxPerTx()
        const minPerTx = await bridgeContract?.minPerTx()
        let dailySpent = dailyLimit.sub(spent??0)


        setParams({
            isInitialized: isInitialized,
            dailyLimit: Fraction.from(dailyLimit, BigNumber.from(10).pow(18)),
            maxPerTx: Fraction.from(maxPerTx, BigNumber.from(10).pow(18)),
            minPerTx: Fraction.from(minPerTx, BigNumber.from(10).pow(18)),
            dailyAllowance: Fraction.from(dailySpent, BigNumber.from(10).pow(18))
        })

    }, [account, bridgeContract, spent])

    useEffect(() => {
        fetchAllParams()
    }, [fetchAllParams, spent, bridgeContract])

    return params
}

export default useBridgeParams
