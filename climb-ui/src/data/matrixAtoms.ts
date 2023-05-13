import { useEffect } from 'react'
import { BigNumber, constants } from 'ethers'
import { atom, useSetAtom } from 'jotai'
import { erc20ABI, useAccount, useContractReads } from 'wagmi'
import {abi as CLIMBABI} from "@/abi/Climb"
import {abi as MINERABI} from "@/abi/Miner"

export const minerAbi = MINERABI;


export const USDT=  "0x55d398326f99059fF775485246999027B3197955"
export const BUSD= "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
export const climbToken = "0xE1a5ADD8401DFb161adb35D120CF15DBb81F0B1D"
export const miner = "0x174B2958095665b9afdB52c8a5372547f5C1d8AF"

export const tokens = {
  usdt: {
    address: USDT,
    decimals: 18,
  },
  busd: {
    address: BUSD,
    decimals: 18,
  }
} as const

export const matrixData = atom({
  climbPrice: BigNumber.from(0),
  matrixClimbBalance: BigNumber.from(0),
  launchDate: 1683950452000,
})

export const tokenBalances = atom({
  usdtBalance: BigNumber.from(0),
  usdtAllowance: BigNumber.from(0),
  busdBalance: BigNumber.from(0),
  busdAllowance: BigNumber.from(0),
})

export const userData = atom({
  totalInvested:  BigNumber.from(0),
  miners: BigNumber.from(0),
  totalRedeemed: BigNumber.from(0),
  referralEggs: BigNumber.from(0),
  allEggs: BigNumber.from(1),
})

export const userClaimable = atom({
  claimable: BigNumber.from(0),
  maxProduction: BigNumber.from(0)
})

export const useMatrixFetchData = () => {
    const setMD = useSetAtom(matrixData)
    const setBalances = useSetAtom(tokenBalances)
    const setUserStats = useSetAtom(userData)
    const setUserClaimable = useSetAtom(userClaimable)

    

    const { address } = useAccount()

    const { refetch: refetchTokenBalances} = useContractReads({
      contracts:[
        
        {
          address: USDT,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [address || "0x0000000000000000000000000000000000000000"]
        },
        {
          address: BUSD,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [address || "0x0000000000000000000000000000000000000000"]
        },
        {
          address: USDT,
          abi: erc20ABI,
          functionName: 'allowance',
          args: [address || "0x0000000000000000000000000000000000000000", miner]
        },
        {
          address: BUSD,
          abi: erc20ABI,
          functionName: 'allowance',
          args: [address || "0x0000000000000000000000000000000000000000", miner]
        },
      ],
      enabled: !!address,
      onSuccess(data){
        if(!data[0])
          return;
        setBalances({
          usdtBalance: data[0],
          busdBalance: data[1],
          usdtAllowance: data[2],
          busdAllowance: data[3],
        })
      }
      
    })
    
    const {refetch} = useContractReads({
      contracts:[
        {
          address: climbToken,
          abi: CLIMBABI,
          functionName: 'balanceOf',
          args: [miner]
        },
        {
          address: climbToken,
          abi: CLIMBABI,
          functionName: 'calculatePrice',
        },
        
      ],
      onSuccess(data){
        if(!data[0])
          return;
        setMD({
          matrixClimbBalance: data[0],
          climbPrice: data[1],
          launchDate: 1683950452000,
        })
      }
      
    })

    const {data: usersStats, refetch: refetchUserStats } = useContractReads({
      contracts: [
        {
          address: miner,
          abi: minerAbi,
          functionName: "user",
          args:[address || constants.AddressZero]
        },
        {
          address: miner,
          abi: minerAbi,
          functionName: "getEggs",
          args:[address || constants.AddressZero],
        }
      ],
      enabled: !!address,
      onSuccess(data){
          if(!data[0])
            return;
          setUserStats({
            totalInvested: data[0].totalInvested,
            miners: data[0].miners,
            totalRedeemed: data[0].totalRedeemed,
            referralEggs: data[0].eggsToClaim,
            allEggs: data[1],
          })
      }
    })

    const { refetch: refetchUserClaimable } = useContractReads({
      contracts: [
        {
          address:miner,
          abi: minerAbi,
          functionName: "calculateEggSell",
          args:[usersStats?.[1] && (usersStats[1].gt(0) ? usersStats[1] : BigNumber.from(1)) || BigNumber.from(1)]
        },
        {
          address: miner,
          abi: minerAbi,
          functionName: "calculateEggSell",
          args: [usersStats?.[0] && (usersStats[0].miners.gt(0) ? usersStats[0].miners.mul(12 * 3600) : BigNumber.from(1)) || BigNumber.from(1)]
        }
      ],
      enabled: !!address,
      onSuccess(data){
        if(!data[0])
          return;
        setUserClaimable({
          claimable: data[0],
          maxProduction: data[1],
        })
      }
    })

    // data Refetch
    useEffect( () => {
      
      const interval = setInterval(() => void refetch(), 15000)

      return () => {
        clearInterval(interval)
      }
    
    },[refetch])

    useEffect( () => {

      if(!address)
        return;
      const interval = setInterval(() => void refetchTokenBalances(), 15000)

      return () => {
        clearInterval(interval)
      }
    
    },[refetchTokenBalances, address])

    useEffect( () => {
      if(!address)
        return;
      
      const interval = setInterval( () => { void refetchUserStats()}, 15000)

      return () => {
        clearInterval(interval)
      }
    },[refetchUserStats, address])

    useEffect( () => {
      if(!address || !usersStats)
        return;
      const interval = setInterval( () => { void refetchUserClaimable()}, 15000)
      return () => clearInterval(interval)
    },[refetchUserClaimable, address, usersStats])
}