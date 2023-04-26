import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  matrixData,
  miner,
  minerAbi,
  testBUSD,
  testUSDT,
  tokenBalances,
  tokens,
} from "@/data/matrixAtoms";
import {
  commify,
  formatEther,
  isAddress,
  parseEther,
} from "ethers/lib/utils.js";
import { constants } from "ethers";
import { useAtomValue } from "jotai";
import { type NextPage } from "next";
import Head from "next/head";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { BigNumber } from "@ethersproject/bignumber";
import { useMemo, useState } from "react";
import classNames from "classnames";
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>MATRIX - Binance Wealth Matrix</title>
        <meta
          name="description"
          content="The matrix is the wealth generator of BWM. Enter USDT or BUSD to start earning $CLIMB"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <MatrixData />
        <Footer />
      </main>
    </>
  );
};

export default Home;

const MatrixData = () => {
  const md = useAtomValue(matrixData);
  return (
    <section className="sparks-bg mb-2 w-full py-16">
      <h1 className="pb-8 text-center text-4xl tracking-wide">
        <strong>B</strong>inance <strong>W</strong>ealth <strong>M</strong>atrix
      </h1>
      <div className="py-2 text-center text-lg tracking-wide">
        <span className=" font-semibold text-primary">Matrix Balance:</span>
        <span className="px-4 font-semibold text-white underline">
          {commify(
            parseFloat(
              formatEther(md.matrixClimbBalance || BigNumber.from("0"))
            ).toFixed(2)
          )}{" "}
        </span>
        <span className="text-white">$CLIMB</span>
      </div>
      <div className="py-2 text-center text-lg tracking-wide">
        <span className=" font-semibold text-primary">Climb Price:</span>
        <span className="px-4 font-semibold text-white underline">
          {commify(
            parseFloat(
              formatEther(md.climbPrice || BigNumber.from("0"))
            ).toFixed(4)
          )}{" "}
        </span>
        <span className="text-white">$USD</span>
      </div>
      <div className="py-2 text-center text-lg tracking-wide">
        <span className=" font-semibold text-primary">Launched:</span>
        <span className="px-4 text-white">
          {formatDistanceToNow(new Date(md.launchDate * 1000), {
            addSuffix: true,
          })}
        </span>
      </div>
      <Deposit />
    </section>
  );
};

type AcceptedTokens = "usdt" | "busd";
const acceptedTokens: AcceptedTokens[] = ["usdt", "busd"];

const Deposit = () => {
  const router = useRouter();
  const { address } = useAccount();
  const referral = isAddress(router.query.ref as string)
    ? (router.query.ref as `0x${string}`)
    : address || constants.AddressZero;
  const [tokenSelected, setTokenSelected] = useState<AcceptedTokens>("usdt");
  const [amount, setAmount] = useState<number | "">("");
  const balances = useAtomValue(tokenBalances);

  const allowances = useMemo(
    () =>
      acceptedTokens.reduce((acc: { [key: string]: BigNumber }, token) => {
        return { ...acc, [token]: balances[`${token}Allowance`] };
      }, {}),
    [balances]
  );

  const { config: prepareApprove } = usePrepareContractWrite({
    address: tokens[tokenSelected].address,
    abi: erc20ABI,
    functionName: "approve",
    args: [miner, constants.MaxUint256],
  });
  const { config: prepareDeposit } = usePrepareContractWrite({
    address: miner,
    abi: minerAbi,
    functionName: "investInMatrix",
    args: [
      referral,
      tokens[tokenSelected].address,
      parseEther((amount || "0").toString()),
    ],
  });

  const { write: approveSpend } = useContractWrite(prepareApprove);
  const { write: deposit } = useContractWrite(prepareDeposit);

  const isAllowed = allowances[tokenSelected]?.gt(
    parseEther((amount || "0").toString())
  );

  return (
    <>
      <div className="flex flex-col items-center justify-center py-4">
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
                  ? parseFloat(amount?.toString() || "0") > 0
                    ? "btn-primary"
                    : "btn-disabled"
                  : "btn-accent"
              )}
              onClick={() => {
                if (isAllowed) {
                  deposit && deposit();
                  return;
                }
                approveSpend && approveSpend();
              }}
            >
              {isAllowed ? "Deposit" : "Approve"}
            </button>
          </span>
        </div>
        <div className="mt-4 rounded-xl border-2 border-secondary bg-base-100 pl-4 text-sm uppercase text-gray-200">
          Current Balance:&nbsp;
          {commify(
            parseFloat(
              formatEther(balances[`${tokenSelected}Balance`] || "0")
            ).toFixed(4)
          )}{" "}
          <select
            className="select ml-2 rounded-lg bg-secondary"
            onChange={(e) => setTokenSelected(e.target.value as AcceptedTokens)}
            value={tokenSelected}
          >
            <option value="usdt">USDT</option>
            <option value="busd">BUSD</option>
          </select>
        </div>
      </div>
    </>
  );
};
