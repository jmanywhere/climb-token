import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { NextPage } from "next";
import Head from "next/head";

const FaqPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Binance Wealth Matrix - FAQ</title>
        <meta
          name="description"
          content="The Binance Wealth Matrix is a completely unique and first-of-its-kind passive income generator available only on the Binance Smart Chain (BSC)."
        />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center pb-12">
          <h1 className="py-6 text-center text-4xl font-bold text-primary">
            BWM FAQ
          </h1>
          <ol
            className="max-w-4xl list-decimal whitespace-pre-wrap text-justify"
            type="1"
          >
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              What is Binance Wealth Matrix?
            </li>
            <p className="py-4">
              The Binance Wealth Matrix is a completely unique and
              first-of-its-kind passive income generator available only on the
              Binance Smart Chain (BSC).
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              What makes Binance Wealth Matrix unique?
            </li>
            <p className="py-4">
              Using tools that are only available in Decentralized Finance,
              we&apos;ve created an asset (CLIMB token) that rises every time
              it&apos;s transacted (investments, reinvestments and redemptions).
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              How does CLIMB token work?
            </li>
            <p className="py-4">
              CLIMB token uses internal Liquidity Pool (LP) technology, which
              means that it&apos;s over 100% collateralized by USDT and BUSD. By
              housing the market maker internal to the contract and not an
              external market maker like PancakeSwap, CLIMB token rises each and
              every time it&apos;s transacted. Think of CLIMB token as a way to
              invest in a Stablecoin that earns you more Stablecoins.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Can I buy CLIMB token outside of the Binance Wealth Matrix?
            </li>
            <p className="py-4">
              No. CLIMB token only exists within the Matrix. CLIMB token&apos;s
              use case is the Matrix, itself, and cannot be purchased via
              PancakeSwap.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Why can&apos;t I buy CLIMB token outside of the Matrix?
            </li>
            <p className="py-4">
              CLIMB token rises via transacting it. That&apos;s how it rises.
              Having investors outside the Matrix buy and hold CLIMB token
              without contributing to the ecosystem via reinvesting will dilute
              the earnings of all other investors. Only OUR investors should
              have the right to benefit from increases in CLIMB token.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Is CLIMB token safe?
            </li>
            <p className="py-4">
              CLIMB token is 100% safe. In fact, unlike tokens with external
              Liquidity Pools, CLIMB token is always100%-plus collateralized by
              USDT and BUSD. That means that for every dollar invested in CLIMB
              token, there is MORE THAN $1.00 in the smart contract.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Why is there no CLIMB chart?
            </li>
            <p className="py-4">
              CLIMB has an internal Liquidity Pool that handles all
              transactions, and thus external charting programs cannot track it.
              In the future we may add an API to show the charting, but
              it&apos;s definitely not necessary. The price of CLIMB rises every
              TX, and the starting price is $1.00, so the price movement will be
              clearly visible.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              How often should I reinvest?
            </li>
            <p className="py-4">
              As often as possible, keeping in mind the gas fees. Frequent
              reinvesting compounds your earnings.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              What is my TVL?
            </li>
            <p className="py-4">
              Your TVL (or Total Value Locked) is a snapshot of your total
              investment value in USD relative to daily earnings. TVL rises by
              investing, reinvesting, and the constant rise in the price of
              CLIMB every TX. TVL falls if reinvesting occurs too infrequently
              and/or redeeming too frequently. Regardless of TVL, daily
              distributions are 3%. By increasing your TVL, however, future
              payouts increase since that 3% will be of a larger number relative
              to the total value of CLIMB in the contract.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Tokenomics that rely on transactional volume rarely work. What
              makes Binance Wealth Matrix different?
            </li>
            <p className="py-4">
              The only way to grow passive income is by frequently reinvesting
              proceeds in order to compound earnings. Reinvestment is the heart
              and soul of the Matrix, and every single investor will be
              motivated to do so as frequently as possible. Secondly, because
              CLIMB token rises each and every time it&apos;s transacted,
              investors will see their value grow every single day.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              What happens if I immediately begin redeeming after investing?
            </li>
            <p className="py-4">
              Your TVL will begin declining rapidly. This is bad. BWM is
              designed for those looking to compound earnings and generate
              passive income for the long term. The goal should be to redeem
              only when your TVL is either flat or trending upwards. This
              ensures your income stream is sustainable month after month after
              month.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Can I redeem my entire investment all at once after entering the
              Binance Wealth Matrix?
            </li>
            <p className="py-4">
              No, as that would defeat the whole purpose of the Matrix. Daily
              distributions are 3% of total CLIMB in TVL. Therefore, no single
              investor can withdraw more than 3% per 24 hours. This is by
              design. By allocating 3% per day, investors can reinvest
              frequently, increase TVL, and ensure future payouts increase over
              time.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Why does the Vault stop filling after 12 hours?
            </li>
            <p className="py-4">
              This is, again, by design. CLIMB token only rises via
              transactions, so we&apos;ve provided a mechanism to ensure
              it&apos;s transacted by each investor MINIMALLY once every 12
              hours. Most investors will be reinvesting dozens of times per day.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              How can I possibly reinvest that often?
            </li>
            <p className="py-4">
              I can&apos;t babysit my dApp 24/7 and remember to reinvest every
              hour or half hour. We recommend Macro Scheduler. After a flat fee
              of $75, for just $19.99/month Macro Scheduler simply and easily
              lets you program your laptop or phone to reinvest automatically at
              intervals you choose. Highly recommended. Visit www.mjtnet.com to
              learn more. We are not affiliated with this company, we simply
              admire their product.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              What happens when redeeming?
            </li>
            <p className="py-4">
              Our dApp automatically converts CLIMB token back into BUSD or
              Tether (USDT).
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              Are there other ways to earn income with
            </li>
            <p className="py-4">
              Binance Wealth Matrix? Yes. Each account is outfitted with its own
              personal referral code. Any time a new investor invests using your
              code, you will receive 10% of those funds back into your Vault.
              For those so motivated, the referral mechanism can generate
              massive profits.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white">
              17. What does the future hold for Binance Wealth Matrix?
            </li>
            <p className="py-4">
              Having external revenue sources that feed BWM is absolutely
              integral to long-term success. We&apos;ve already begun efforts in
              that regard.
              {"\n\n"}
              <a className="text-primary underline" href="https://dappd.net">
                dappd.net
              </a>{" "}
              is a leading DeFi innovator and at the forefront of Blockchain
              technology, specifically allowing projects and project leaders
              early access. BWM has an exclusive arrangement that will burn
              CLIMB each and every time a transaction takes place on their
              platform. Estimated launch for this exciting new tech is Q3 2023.
              The next evolution of BWM will see a gaming function. All the
              pieces are in place for us to release a game for our community
              that will further benefit Matrix investors. Look for that in Q4 of
              2023.
            </p>
          </ol>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default FaqPage;
