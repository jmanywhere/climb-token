import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  matrixData,
  matrixDeposit,
  miner,
  minerAbi,
  tokenBalances,
  tokens,
} from "@/data/matrixAtoms";
import classNames from "classnames";
import { BigNumber, constants } from "ethers";
import { commify, formatEther, parseEther } from "ethers/lib/utils.js";
import { useAtom, useAtomValue } from "jotai";
import type { NextPage } from "next";
import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import {
  useAccount,
  usePrepareContractWrite,
  erc20ABI,
  useContractWrite,
} from "wagmi";
import { AcceptedTokens, acceptedTokens } from "./matrix";
import {
  liquidatorImportantData,
  marketAbi,
  marketData,
  moneyMarket,
} from "@/data/marketAtoms";

const MoneyMarketPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Money Market - Binance Wealth Matrix</title>
        <meta
          name="description"
          content="The money market is a great solution for those who dont want to be consistently checking the Matrix. Deposit, wait for the price to rise and withdraw with profit."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <MarketTitle />
        <StatContainer />
        <LiquidationSection />
        <Footer />
      </main>
    </>
  );
};

export default MoneyMarketPage;

const MarketTitle = () => {
  const md = useAtomValue(matrixData);
  const marketInfo = useAtomValue(marketData);
  const liquidatorInfo = useAtomValue(liquidatorImportantData);
  return (
    <section className="sparks-bg mb-2 w-full py-16">
      <h1 className="pb-2 text-center text-4xl tracking-wide">
        <strong>M</strong>atrix <strong>M</strong>oney <strong>M</strong>arket
      </h1>
      <h2 className="animate-pulse whitespace-pre-wrap pb-6 text-center text-2xl md:whitespace-normal">
        Deposit. Liquidate.{"\n"}PROFIT.
      </h2>
      <div className="main-progress flex flex-col items-center justify-center">
        <progress
          value={parseFloat(formatEther(marketInfo.totalClimbInMarket))}
          max={parseFloat(formatEther(md.matrixClimbBalance.mul(25).div(100)))}
        />
      </div>
      <div className="py-2 text-center text-lg tracking-wide">
        <span className=" font-semibold text-primary">Climb Price:</span>
        <span className="px-4 font-semibold text-white underline">
          {commify(
            parseFloat(
              formatEther(md.climbPrice || BigNumber.from("0"))
            ).toFixed(10)
          )
            .split(".")
            .map((v, i) => (i == 1 && parseInt(v) == 0 ? "0000000000" : v))
            .join(".")}{" "}
        </span>
        <span className="text-white">$USD</span>
      </div>
      <div className="py-2 text-center text-lg tracking-wide">
        <span className=" font-semibold text-primary">Users in Market:</span>
        <span className="px-4 font-semibold text-white underline">
          {commify(liquidatorInfo.usersParticipating.toString())}
        </span>
      </div>
      <Deposit />
    </section>
  );
};

const Deposit = () => {
  const [loading, setLoading] = useState(false);
  const [eventAmount, setEventAmount] = useAtom(matrixDeposit);
  const marketInfo = useAtomValue(marketData);

  const [tokenSelected, setTokenSelected] = useState<AcceptedTokens>("usdt");
  const [amount, setAmount] = useState<number | "">("");
  const balances = useAtomValue(tokenBalances);

  const allowances = useMemo(
    () =>
      acceptedTokens.reduce((acc: { [key: string]: BigNumber }, token) => {
        return { ...acc, [token]: balances[`${token}MarketAllowance`] };
      }, {}),
    [balances]
  );

  useEffect(() => {
    if (eventAmount > 0) {
      setAmount(eventAmount);
      setEventAmount(0);
    }
  }, [eventAmount, setEventAmount]);

  const { config: prepareApprove } = usePrepareContractWrite({
    address: tokens[tokenSelected].address,
    abi: erc20ABI,
    functionName: "approve",
    args: [moneyMarket, constants.MaxUint256],
  });
  const { config: prepareDeposit, error: depositPrepareError } =
    usePrepareContractWrite({
      address: moneyMarket,
      abi: marketAbi,
      functionName: "deposit",
      args: [
        parseEther((amount || "0").toString()),
        tokens[tokenSelected].address,
      ],
    });

  const { writeAsync: approveSpend } = useContractWrite(prepareApprove);
  const { writeAsync: deposit } = useContractWrite(prepareDeposit);

  const isAllowed = allowances[tokenSelected]?.gt(
    parseEther((amount || "0").toString())
  );
  const hasNOTDeposited = useMemo(
    () => marketInfo.deposited.isZero(),
    [marketInfo]
  );
  return (
    <>
      {hasNOTDeposited ? (
        <div className="flex flex-col items-center justify-center px-4 py-4">
          <div className="input-group max-w-sm rounded-xl bg-white">
            <input
              type="number"
              placeholder="Enter amount"
              className="input-bordered input w-full border-r-0 bg-white text-black"
              onFocus={(e) => e.target.select()}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.valueAsNumber || "");
              }}
            />
            <button
              className="btn-ghost btn border-0 font-normal text-gray-500"
              onClick={() =>
                setAmount(
                  parseFloat(formatEther(balances[`${tokenSelected}Balance`]))
                )
              }
            >
              MAX
            </button>
            <span className="px-0">
              <button
                className={classNames(
                  "btn ",
                  " rounded-l-none",
                  isAllowed
                    ? parseFloat(amount?.toString() || "0") > 0 &&
                      !depositPrepareError
                      ? "btn-primary"
                      : "btn-disabled"
                    : "btn-accent",
                  loading ? "loading" : ""
                )}
                onClick={() => {
                  setLoading(true);
                  if (isAllowed) {
                    deposit &&
                      void deposit()
                        .then(async (x) => {
                          await x
                            .wait(2)
                            .then((r) => {
                              console.log("receipt", r);
                              setAmount("");
                              setLoading(false);
                            })
                            .catch((e) => console.log("error", e));
                        })
                        .catch((e) => {
                          console.log("probably error", e);
                        })
                        .finally(() => {
                          console.log("finally shit is done");
                          setLoading(false);
                        });
                    return;
                  }
                  approveSpend &&
                    approveSpend()
                      .catch((e) => console.log("error on spend", e))
                      .finally(() => setLoading(false));
                }}
              >
                {isAllowed ? "Deposit" : "Approve"}
              </button>
            </span>
          </div>
          <div className="w-full max-w-sm pl-2 pt-2 text-sm">Min: 100 USD</div>

          <div className="mt-4 rounded-xl border-2 border-secondary bg-base-100 pl-4 text-sm uppercase text-gray-200">
            Balance:&nbsp;
            {commify(
              parseFloat(
                formatEther(balances[`${tokenSelected}Balance`] || "0")
              ).toFixed(4)
            )}{" "}
            <select
              className="select ml-2 rounded-lg bg-secondary"
              onChange={(e) =>
                setTokenSelected(e.target.value as AcceptedTokens)
              }
              value={tokenSelected}
            >
              <option value="usdt">USDT</option>
              <option value="busd">BUSD</option>
            </select>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center px-4 py-4">
            <div className="py-2 text-center text-lg tracking-wide">
              <span className=" font-semibold text-primary">Locked In:</span>
              <span className="px-4 font-semibold text-white underline">
                {commify(
                  parseFloat(
                    formatEther(marketInfo.deposited || BigNumber.from("0"))
                  ).toFixed(2)
                )}{" "}
              </span>
              <span className="text-white">$USD</span>
            </div>
            <div className="py-2 text-center text-lg tracking-wide">
              <span className=" font-semibold text-primary">Goal Price:</span>
              <span className="px-4 font-semibold text-white underline">
                {commify(
                  parseFloat(
                    formatEther(marketInfo.endPrice || BigNumber.from("0"))
                  ).toFixed(10)
                )
                  .split(".")
                  .map((v, i) =>
                    i == 1 && parseInt(v) == 0 ? "0000000000" : v
                  )
                  .join(".")}{" "}
              </span>
              <span className="text-white">$USD</span>
            </div>
          </div>
          <MarketSelfLiquidate />
        </>
      )}
    </>
  );
};

const MarketSelfLiquidate = () => {
  const marketInfo = useAtomValue(marketData);
  const matrixInfo = useAtomValue(matrixData);

  const canClaim = useMemo(
    () => matrixInfo.climbPrice.gte(marketInfo.endPrice),
    [matrixInfo, marketInfo]
  );

  return (
    <section className="flex flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-center px-4 py-4">
        <button
          className={classNames(
            "btn-primary btn",
            canClaim ? "" : "btn-disabled hidden"
          )}
        >
          Self Liquidate
        </button>
        <button
          className={classNames(
            "btn-warning btn",
            canClaim ? "btn-disabled hidden" : ""
          )}
        >
          Force Liquidate
        </button>
      </div>
      {canClaim ? null : (
        <div className="max-w-sm px-4 text-justify text-sm text-gray-400">
          <strong className="font-bold text-yellow-500/80">Warning:</strong>
          &nbsp;Only click&nbsp;
          <strong className="font-bold text-yellow-500/80">
            Force Liquidate
          </strong>
          &nbsp; if you want to redeem funds from the Money Market before the
          profit target has been reached. There is a <strong>5%</strong> penalty
          for liquidating early which will be immediately burned.
        </div>
      )}
    </section>
  );
};

const StatContainer = () => {
  const marketInfo = useAtomValue(marketData);

  const roi = useMemo(() => {
    if (marketInfo.deposited.isZero()) return 0;
    return (
      (parseFloat(
        commify(
          formatEther(
            marketInfo.endPrice
              .mul(marketInfo.climbAllocated)
              .mul(95)
              .div(100)
              .div(parseEther("1"))
          )
        )
      ) *
        100) /
        parseFloat(
          marketInfo.deposited.isZero()
            ? "1"
            : commify(formatEther(marketInfo.deposited))
        ) -
      100
    );
  }, [marketInfo]);
  return (
    <section className="py-4">
      <h3 className=" w-full text-center text-2xl">
        <strong>P</strong>ersonal&nbsp;<strong>S</strong>tats
      </h3>
      <div className="container mx-auto flex w-full max-w-2xl flex-row flex-wrap justify-center gap-x-6 gap-y-6 py-8">
        <div className="stats shadow">
          <div className="stat min-w-[260px] max-w-full bg-gradient-to-b from-primary to-accent to-90% sm:min-w-[320px]">
            <div className="stat-title font-bold text-accent">
              Total Invested
            </div>
            <div className="stat-value text-white">
              {commify(formatEther(marketInfo.deposited))
                .split(".")
                .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
                .join(".")}
            </div>
            <div className="stat-desc">USD</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat min-w-[260px] max-w-full bg-gradient-to-b from-primary to-accent to-90% sm:min-w-[320px]">
            <div className="stat-title font-bold text-accent">Climb Amount</div>
            <div className="stat-value text-white">
              {commify(formatEther(marketInfo.climbAllocated))
                .split(".")
                .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
                .join(".")}
            </div>
            <div className="stat-desc">CLIMB</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat min-w-[260px] max-w-full bg-gradient-to-b from-primary to-accent to-90% sm:min-w-[320px]">
            <div className="stat-title font-bold text-accent">Goal Price</div>
            <div className="stat-value text-white">
              {commify(formatEther(marketInfo.endPrice))
                .split(".")
                .map((x, i) => (i === 1 ? x.slice(0, 10) : x))
                .join(".")}
            </div>
            <div className="stat-desc">CLIMB</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat min-w-[260px] max-w-full bg-gradient-to-b from-primary to-accent to-90% sm:min-w-[320px]">
            <div className="stat-title font-bold text-accent">
              Minimum Return
            </div>
            <div className="stat-value text-white">
              {roi}
              &nbsp;%
            </div>
            <div className="stat-desc">ROI</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LiquidationSection = () => {
  const [tokenSelected, setTokenSelected] = useState<AcceptedTokens>("usdt");
  const [usersSelected, setUsersSelected] = useState<string[]>([]);
  const liquidatorInfo = useAtomValue(liquidatorImportantData);
  const toLiquidate = useMemo(() => {
    return liquidatorInfo.toLiquidate.filter(
      (x) => x !== constants.AddressZero
    );
  }, [liquidatorInfo]);

  console.log(toLiquidate, liquidatorInfo.toLiquidate);

  return (
    <section className="flex flex-col items-center justify-center">
      <h3 className=" w-full text-center text-2xl">
        <strong>L</strong>iquidations
      </h3>
      <p className="w-full max-w-sm px-2 py-4 text-center text-sm text-gray-400">
        Earn a bit of cash by liquidating other users when they reach their
        profit level. Earnings are based on the excedent of profit for a user.
      </p>
      <div>
        Liquidate with:
        <select
          className="select ml-2 rounded-lg bg-secondary"
          onChange={(e) => setTokenSelected(e.target.value as AcceptedTokens)}
          value={tokenSelected}
        >
          <option value="usdt">USDT</option>
          <option value="busd">BUSD</option>
        </select>
      </div>
      <div className="pt-2 text-xs text-gray-400">
        Token to receive for both USER and LIQUIDATOR
      </div>
      <div className="overflow-x-auto">
        {toLiquidate.length > 0 ? null : (
          <div className="py-12 text-center text-gray-400">
            No liquidations available
          </div>
        )}
      </div>
    </section>
  );
};
