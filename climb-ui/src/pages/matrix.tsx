import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  matrixData,
  miner,
  minerAbi,
  tokenBalances,
  tokens,
  userClaimable,
  userData,
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
  const { address } = useAccount();
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
        <h2 className="pb-10 pt-3 text-center text-3xl tracking-wide">
          <strong>P</strong>ersonal&nbsp;<strong>S</strong>tats
        </h2>
        <StatsContainer />
        <ActionButtons />
        <section className="flex flex-row items-center justify-center px-4 py-6">
          <div className="card w-96 bg-secondary ">
            <div className="card-body">
              <h3 className=" w-full text-center text-2xl">
                <strong>R</strong>eferral <strong>L</strong>ink
              </h3>
              <p>
                Use the link below to invite your friends and receive 10%
                commission every time they invest or Reinvest.
              </p>
              <a
                href={address ? `/matrix?ref=${address}` : "about:blank"}
                target="_blank"
                className="break-all underline underline-offset-4"
              >
                {!address
                  ? "Connect Wallet to get Referral Link"
                  : `https://binancewealthmatrix.com/matrix?ref=${address}`}
              </a>
            </div>
          </div>
        </section>
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
            ).toFixed(7)
          )}{" "}
        </span>
        <span className="text-white">$USD</span>
      </div>
      <div className="py-2 text-center text-lg tracking-wide">
        <span className=" font-semibold text-primary">Launched:</span>
        <span className="px-4 text-white">
          {/* {formatDistanceToNow(new Date(md.launchDate * 1000), {
            addSuffix: true,
          })} */}
          PENDING
        </span>
      </div>
      <Deposit />
    </section>
  );
};

type AcceptedTokens = "usdt" | "busd";
const acceptedTokens: AcceptedTokens[] = ["usdt", "busd"];

const Deposit = () => {
  const [loading, setLoading] = useState(false);

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
  const { config: prepareDeposit, error: depositPrepareError } =
    usePrepareContractWrite({
      address: miner,
      abi: minerAbi,
      functionName: "investInMatrix",
      args: [
        referral,
        tokens[tokenSelected].address,
        parseEther((amount || "0").toString()),
      ],
    });

  const { writeAsync: approveSpend } = useContractWrite(prepareApprove);
  const { writeAsync: deposit } = useContractWrite(prepareDeposit);

  const isAllowed = allowances[tokenSelected]?.gt(
    parseEther((amount || "0").toString())
  );
  return (
    <>
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
                        setLoading(false);
                      })
                      .finally(() => console.log("finally shit is done"));
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
        <div className="mt-4 rounded-xl border-2 border-secondary bg-base-100 pl-4 text-sm uppercase text-gray-200">
          Balance:&nbsp;
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

const StatsContainer = () => {
  const userInfo = useAtomValue(userData);
  const md = useAtomValue(matrixData);
  const userClaim = useAtomValue(userClaimable);
  return (
    <section className="container mx-auto flex w-full max-w-2xl flex-row flex-wrap justify-center gap-x-6 gap-y-6 pb-8">
      <div className="stats shadow">
        <div className="stat min-w-[320px] max-w-full bg-gradient-to-b from-primary to-accent to-90%">
          <div className="stat-title font-bold text-accent">Total Invested</div>
          <div className="stat-value text-white">
            {commify(formatEther(userInfo.totalInvested))
              .split(".")
              .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
              .join(".")}
          </div>
          <div className="stat-desc">CLIMB</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat min-w-[320px] max-w-full bg-gradient-to-b from-primary to-accent to-90%">
          <div className="stat-title font-bold text-accent">VAULT TVL</div>
          <div className="stat-value text-white">
            {commify(
              formatEther(
                userInfo.totalInvested.mul(md.climbPrice).div(parseEther("1"))
              )
            )
              .split(".")
              .map((x, i) => (i === 1 ? x.slice(0, 2) : x))
              .join(".")}
          </div>
          <div className="stat-desc">USD</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat min-w-[320px] max-w-full bg-gradient-to-b from-primary to-accent to-90%">
          <div className="stat-title font-bold text-accent">
            Referral Rewards
          </div>
          <div className="stat-value text-white">
            {commify(
              formatEther(
                userClaim.claimable
                  .mul(userInfo.referralEggs)
                  .div(userInfo.allEggs.isZero() ? 1 : userInfo.allEggs)
              )
            )
              .split(".")
              .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
              .join(".")}
          </div>
          <div className="stat-desc">CLIMB</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat min-w-[320px] max-w-full bg-gradient-to-b from-primary to-accent to-90%">
          <div className="stat-title font-bold text-accent">CLAIMABLE</div>
          <div className="stat-value text-white">
            {commify(formatEther(userClaim.claimable))
              .split(".")
              .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
              .join(".")}
          </div>
          <div className="stat-desc">CLIMB</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat min-w-[320px] max-w-full bg-gradient-to-b from-primary to-accent to-90%">
          <div className="stat-title font-bold text-accent">
            Total Redemptions
          </div>
          <div className="stat-value text-white">
            {commify(formatEther(userInfo.totalRedeemed))
              .split(".")
              .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
              .join(".")}
          </div>
          <div className="stat-desc">CLIMB</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat min-w-[320px] max-w-full bg-gradient-to-b from-primary to-accent to-90%">
          <div className="stat-title font-bold text-accent">Max Production</div>
          <div className="stat-value text-white">
            {commify(formatEther(userClaim.maxProduction))
              .split(".")
              .map((x, i) => (i === 1 ? x.slice(0, 4) : x))
              .join(".")}
          </div>
          <div className="stat-desc">MAX CLIMB every 12 hours</div>
        </div>
      </div>
    </section>
  );
};

const ActionButtons = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { address } = useAccount();
  const referral = isAddress(router.query.ref as string)
    ? (router.query.ref as `0x${string}`)
    : address || constants.AddressZero;

  const { config: prepareCompound } = usePrepareContractWrite({
    address: miner,
    abi: minerAbi,
    functionName: "reinvestInMatrix",
    args: [referral],
  });
  const { config: prepareRedeem } = usePrepareContractWrite({
    address: miner,
    abi: minerAbi,
    functionName: "matrixRedeem",
  });

  const { writeAsync: compound } = useContractWrite(prepareCompound);
  const { writeAsync: redeem } = useContractWrite(prepareRedeem);

  return (
    <section className="sparks-bg flex w-full flex-row items-center justify-center gap-x-10 px-4 py-6">
      <button
        className={classNames(
          "btn-outline btn-primary btn",
          loading ? "btn-disabled loading" : ""
        )}
        onClick={() => {
          setLoading(true);
          compound &&
            void compound()
              .then(
                async (x) =>
                  await x
                    .wait()
                    .then((r) => {
                      console.log(r);
                      setLoading(false);
                    })
                    .catch((e) => {
                      console.log(e);
                      setLoading(false);
                    })
              )
              .catch((e) => {
                console.log(e);
                setLoading(false);
              });
        }}
      >
        Reinvest $CLIMB
      </button>
      <button
        className={classNames(
          "btn-outline btn-accent btn",
          loading ? "btn-disabled loading" : ""
        )}
        onClick={() => {
          setLoading(true);
          redeem &&
            void redeem()
              .then(
                async (x) =>
                  await x
                    .wait()
                    .then((r) => {
                      console.log(r);
                      setLoading(false);
                    })
                    .catch((e) => {
                      console.log(e);
                      setLoading(false);
                    })
              )
              .catch((e) => {
                console.log(e);
                setLoading(false);
              });
        }}
      >
        Redeem Stable
      </button>
    </section>
  );
};
