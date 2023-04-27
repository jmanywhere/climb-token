import { useEffect } from 'react'
import { BigNumber, constants } from 'ethers'
import { atom, useAtom, useSetAtom } from 'jotai'
import { erc20ABI, useAccount, useContractReads } from 'wagmi'
import {abi as CLIMBABI} from "@/abi/Climb"
import {abi as MINERABI} from "@/abi/Miner"
import { parseEther } from 'ethers/lib/utils.js'

export const minerAbi = MINERABI;


export const testUSDT=  "0xb6D07D107FF8e26A21E497Bf64c3239101FED3Cf"
export const testBUSD= "0xBe6DDd788b563807A0E60fE4EA6c06149c049735"
export const climbToken = "0x8Bc8B21717b919903312555dF66B50c5F1976e8f"
export const miner = "0x6B5655E37A6AD840EC081775C78b6ecE954fC64D"

export const tokens = {
  usdt: {
    address: testUSDT,
    decimals: 18,
  },
  busd: {
    address: testBUSD,
    decimals: 18,
  }
} as const

export const matrixData = atom({
  climbPrice: BigNumber.from(0),
  matrixClimbBalance: BigNumber.from(0),
  launchDate: 1682526508,
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
          address: testUSDT,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [address || "0x0000000000000000000000000000000000000000"]
        },
        {
          address: testBUSD,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [address || "0x0000000000000000000000000000000000000000"]
        },
        {
          address: testUSDT,
          abi: erc20ABI,
          functionName: 'allowance',
          args: [address || "0x0000000000000000000000000000000000000000", miner]
        },
        {
          address: testBUSD,
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
          launchDate: 1682526508,
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