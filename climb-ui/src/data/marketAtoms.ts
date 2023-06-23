import { useEffect } from 'react'
import { BigNumber, constants } from 'ethers'
import { atom, useSetAtom } from 'jotai'
import { useAccount, useContractReads } from 'wagmi'
import { erc20ABI, useAccount, useContractReads } from 'wagmi'
import MarketABI from '@/abi/Market'

import { USDT, BUSD, climbToken, miner } from '@/data/matrixAtoms'

const moneyMarket = "0xabcd"

export const marketData = atom({
  deposited: BigNumber.from(0),
  climbAllocated: BigNumber.from(0),
  startingPrice: BigNumber.from(0),
  endPrice: BigNumber.from(0),
  preferredToken: constants.AddressZero,
})

export const liquidatorImportantData = atom({
  usersParticipating: BigNumber.from(0),
  toLiquidate: [] as Array<string>,
})

export const useMarketFetchData = () => {
  const setMarketData = useSetAtom(marketData)
  const setLiquidatorData = useSetAtom(liquidatorImportantData)

  const { address } = useAccount()

  const { refetch } = useContractReads({
    contracts: [
      {
        address: moneyMarket,
        abi: MarketABI,
        functionName: "users",
        args: [address || constants.AddressZero]
      },
      {
        address: moneyMarket,
        abi: MarketABI,
        functionName: "getTotalUsers"
      },
      {
        address: moneyMarket,
        abi: MarketABI,
        functionName: "getUsersAvailForLiquidation"
      },
    ],

    onSuccess(data) {
      if(!data[0])
        return;
      setMarketData({
        deposited: data[0].depositAmount,
        climbAllocated: data[0].climbAmount,
        startingPrice: data[0].startingPrice,
        endPrice: data[0].endPrice,
        preferredToken: data[0].preferredToken,
      })

      setLiquidatorData({
        usersParticipating: data[1],
        toLiquidate: data[2],
      })
    }
  })

  useEffect(() => {
      const interval = setInterval( () => void refetch(), 15000);
      return () => clearInterval(interval);
  }, [refetch])

}