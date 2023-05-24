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
            className="max-w-4xl list-decimal whitespace-pre-wrap text-justify text-white/90"
            type="1"
          >
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              What is Binance Wealth Matrix?
            </li>
            <p className="py-4">
              The Binance Wealth Matrix is a completely unique and
              first-of-its-kind passive income generator available only on the
              Binance Smart Chain (BSC).
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              What makes Binance Wealth Matrix unique?
            </li>
            <p className="py-4">
              Using tools that are only available in Decentralized Finance,
              we&apos;ve created an asset (CLIMB token) that rises every time
              it&apos;s transacted (investments, reinvestments and redemptions).
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
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
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Can I buy CLIMB token outside of the Binance Wealth Matrix?
            </li>
            <p className="py-4">
              No. CLIMB token only exists within the Matrix. CLIMB token&apos;s
              use case is the Matrix, itself, and cannot be purchased via
              PancakeSwap.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Why can&apos;t I buy CLIMB token outside of the Matrix?
            </li>
            <p className="py-4">
              CLIMB token rises via transacting it. That&apos;s how it rises.
              Having investors outside the Matrix buy and hold CLIMB token
              without contributing to the ecosystem via reinvesting will dilute
              the earnings of all other investors. Only OUR investors should
              have the right to benefit from increases in CLIMB token.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Is CLIMB token safe?
            </li>
            <p className="py-4">
              CLIMB token is 100% safe. In fact, unlike tokens with external
              Liquidity Pools, CLIMB token is always100%-plus collateralized by
              USDT and BUSD. That means that for every dollar invested in CLIMB
              token, there is MORE THAN $1.00 in the smart contract.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
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
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              How often should I reinvest?
            </li>
            <p className="py-4">
              As often as possible, keeping in mind the gas fees. Frequent
              reinvesting compounds your earnings.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Please explain the BWM dApp dashboard, what do all the numbers
              mean?
            </li>
            <p className="py-4">
              Here&apos;s an in-depth look at the dashboard.
              {"\n"}
              <span className="font-bold text-primary-focus">
                Total Invested:
              </span>
              {"\n"}
              This number represents the total amount of CLIMB owned. Keep in
              mind, this amount does not just include investments made, but also
              any REINVESTED funds attained via referral distributions. For
              example, if you purchased 200 CLIMB and attained an extra 100
              CLIMB via referral revenue, your Total Invested would be 300
              CLIMB.
              {"\n"}
              <span className="font-bold text-primary-focus">Vault TVL:</span>
              {"\n"}
              This number represents in USD the total locked value of your CLIMB
              investment in US dollars.
              <span className="font-bold text-primary-focus">
                {"\n"}
                Referral Rewards:
              </span>
              {"\n"}
              Although this is self explanatory, it is worth noting that
              referral rewards do not stack over time. For example, if you have
              100 CLIMB visible in your referral rewards, the very next action
              you take on the dApp will determine the fate of those rewards.
              They will either be added to Total Invested if you reinvest, or
              they will be added to Total Redemptions if redeemed.
              {"\n"}
              <span className="font-bold text-primary-focus">
                Total Redemptions:
              </span>
              {"\n"}
              This represents the total amount of CLIMB redeemed from the
              Matrix.
              {"\n"}
              <span className="font-bold text-primary-focus">
                Max Production:
              </span>
              {"\n"}
              Max Production (MP) represents the maximum amount of CLIMB that
              will be available for redemption after 12 hours.
              {"\n"}
              There are <em>MANY</em> factors that contribute to an
              investor&apos;s MP amount.
              {"\n"}
              ON AVERAGE, the return is 1.5% every 12 hours. At any given time
              that number can be HIGHER or LOWER than 1.5% every 12 hours.
              {"\n"}
              There are several factors that contribute to an investor&apos;s MP
              amount.
              {"\n"}
              <ul className="list-disc pl-12">
                <li>A rising communal TVL will generally yield higher MP</li>
                <li>A falling communal TVL will generally yield lower MP</li>
                <li>
                  Frequent reinvesting helps raise MP during communal rises in
                  TVL
                </li>
                <li>
                  Frequent reinvesting helps reduce the rate of MP depreciation
                  during communal reductions in communal TVL
                </li>
                <li>Frequent redeeming will lower MP</li>
                <li>Steady referral income will raise MP</li>
              </ul>
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
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
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
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
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
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
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Why does the Vault stop filling after 12 hours?
            </li>
            <p className="py-4">
              This is, again, by design. CLIMB token only rises via
              transactions, so we&apos;ve provided a mechanism to ensure
              it&apos;s transacted by each investor MINIMALLY once every 12
              hours. Most investors will be reinvesting dozens of times per day.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
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
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              What happens when redeeming?
            </li>
            <p className="py-4">
              Our dApp automatically converts CLIMB token back into BUSD or
              Tether (USDT).
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Are there other ways to earn income with Binance Wealth Matrix?
            </li>
            <p className="py-4">
              Yes. Each account is outfitted with its own personal referral
              code. Any time a new investor invests using your code, you will
              receive 10% of those funds back into your Vault. For those so
              motivated, the referral mechanism can generate massive profits.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              What does the future hold for Binance Wealth Matrix?
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
              {"\n\n"}The next evolution of BWM will see a gaming function in Q4
              2023 that will benefit investors as well as the ecosystem. In
              addition, a line of NFTs will be introduced that burn CLIMB, as
              well as add entry into our future gaming function.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Is there a minimum investment required to enter the Matrix?
            </li>
            <p className="py-4">
              Yes. The minimum investment required to generate rewards is shown
              in our dApp. Please note, this minimum amount is required to be
              invested EVERY SINGLE TIME you invest. If the minimum is $7.00
              USD, for example, you must invest at least $7.00 at one time to
              activate rewards.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              Why does the minimum investment amount keep rising?
            </li>
            <p className="py-4">
              Due to CLIMB&apos;s appreciation, the minimum necessary to receive
              rewards will necessarily go up.  Follow the dApp for guidance.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              I invested less than the minimum requirement to receive rewards.
              {"\n"}
              Can&apos;t I just make up the difference and invest what is
              necessary to put me over the minimum?
            </li>
            <p className="py-4">
              No, that is not possible. Rewards are only activated when a TX
              over the minimum is conducted. You can&apos;t combine multiple TXs
              in order to cross the minimum threshold required for rewards.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              If I deposit the minimum on my first TX to activate the rewards,
              and I invest less than that the next time I decide to put new
              money in, will the new money add to my rewards since I&apos;ve
              previously activated them?
            </li>
            <p className="py-4">
              No. Each individual investment must be at least the minimum shown
              in the dApp. That number is constantly rising, so MAKE SURE you
              verify the amount each time you invest.
            </p>
            <li className="rounded-tr-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-primary marker:text-white/90">
              What should I do when the communal TVL is falling? Isn&apos;t that
              bad? Shouldn&apos;t we always want the TVL to go up?
            </li>
            <p className="py-4">
              NO! NOT in the BWM. The Matrix needs the communal TVL to have
              peaks and valleys. The greater the TVL volatility, the more rapid
              the price movement of CLIMB is.
              {"\n"}
              Remember, the supply of CLIMB is fungible. As tokens are redeemed,
              or sold, this reduces the total supply which INCREASES price
              impact on future trades.
              {"\n"}
              Your mindset must be that the BWM is a LONG TERM play. You want to
              generate passive income over MONTHS and YEARS, and that means
              redeeming a couple of times a month to pay expenses and withdraw
              some profit. Expect to see many, many peaks and valleys in total
              TVL. It&apos;s the way the ecosystem is designed to function.
            </p>
          </ol>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default FaqPage;
