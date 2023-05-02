import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { NextPage } from "next";
import Head from "next/head";

const ClimbPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Binance Wealth Matrix</title>
        <meta
          name="description"
          content="The Binance Wealth Matrix is a completely unique and first-of-its-kind passive income generator available only on the Binance Smart Chain (BSC)."
        />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-grow flex-col items-center px-8">
          <h1 className="py-6 text-center text-4xl text-primary">
            <strong>H</strong>OW <strong>C</strong>LIMB <strong>W</strong>ORKS
          </h1>
          <p className="max-w-4xl whitespace-pre-wrap text-justify">
            Each CLIMB token utilizes a built-in contract exchange system that
            renounces the need for a traditional Liquidity Pool. Rather than a
            Liquidity Pool pairing of the backing asset to the token using a
            traditional market maker method for exchange and price calculation,
            both assets are stored within the contract itself.{"\n\n"}To
            purchase CLIMB tokens, each investor interacts directly with the
            contract via our dApp using BUSD (BEP20) or Tether (BEP20). These
            contracts are commonly referred to as &quot;Swapper&quot; contracts.
            This mitigates the need for a Decentralized Exchange (DEx) or
            Centralized Exchange (CEx).{"\n\n"}When the contract receives BUSD
            or Tether, the BUSD or Tether is swapped for the backing asset, and
            the price value equivalent of CLIMB are minted to increase the total
            supply.{"\n\n"}Redeeming, or selling, has the opposing effect. Total
            supply is decreased, and the backing asset is converted back into
            BUSD or Tether and returned to the investor&apos;s wallet.
            {"\n\n"}NOTE: CLIMB&apos;s price is not set by the standard market
            maker protocol. Through the power of mathematics, a different
            equation for determining price and its movement is used.
          </p>
          <h2 className="py-6 text-center text-2xl uppercase text-primary">
            What happens when CLIMB tokens are bought or sold?
          </h2>
          <p className="max-w-4xl whitespace-pre-wrap text-justify">
            The price action algorithm is described as a{" "}
            <strong className="text-primary">
              Price-Increase Tax Ratio (PTR)
            </strong>
            . This algorithm allocates the tax on purchases and sales to shift
            the ratio between the backing asset and the dynamic total supply of
            the token more in favor of the backing asset. PTR maintains a
            consistent increase in token value to the backing asset regardless
            of the type of transaction executed.
          </p>
          <h3 className="w-full max-w-4xl py-6 text-left text-lg font-bold uppercase text-primary">
            PTR (buys):
          </h3>
          <p className="max-w-4xl whitespace-pre-wrap text-justify">
            <strong className="text-primary">CLIMB</strong> token has a{" "}
            <span className="text-primary">5%</span> buy tax, of which 4% goes
            towards raising the price of <strong>CLIMB</strong>.{" "}
            <span className="text-primary">1%</span> is allocated to the owner
            wallet for expenses/marketing. When bought, new tokens are minted
            into the total supply. The total supply of tokens increases and the
            buyer will receive:{"\n\n"}
          </p>
          <code className="text-center">
            (CLIMB) - (CLIMB * 0.05), or 95% of CLIMB purchased at current
            value.
          </code>
          <p className="max-w-4xl whitespace-pre-wrap pt-6 text-justify">
            <span className="text-primary">100%</span> of the proceeds used
            after tax for purchase is swapped for the value equivalent of the
            backing asset (BUSD or USDT). The backing asset is then routed to
            the contract pool. Using this scenario, if the asset and CLIMB
            quantities were both equal before this transaction, PTR would cause
            a shift in favor of the backing asset, triggering an increase in the
            price value of the token.
          </p>
          <h3 className="w-full max-w-4xl py-6 text-left text-lg font-bold uppercase text-primary">
            PTR (sells):
          </h3>
          <p className="max-w-4xl whitespace-pre-wrap text-justify">
            When CLIMB is sold back to the contract, the seller pays the same{" "}
            <span className="text-primary">5%</span>&nbsp;tax on the asset they
            receive. <span className="text-primary">99%</span> of the tokens
            sold are then destroyed and completely removed from the total
            supply. As a result, the total supply of CLIMB decreases, and the
            seller receives:
            {"\n\n"}
          </p>
          <code>
            (CLIMB) - (CLIMB * 0.05), or 95% of CLIMB sold at current value.
          </code>
          <p className="max-w-4xl whitespace-pre-wrap pt-6 text-justify">
            So even after a sell, the ratio shifts further in favor of the asset
            in the contract, as more is left in the contract when the token
            supply decreases. CLIMB&apos;s price increases further as a result.
            {"\n\n"}With this equation and tax system employed, because BUSD and
            Tether are non-volatile assets, the price value per token can never
            decrease. It only ever increases as transactions are made.{"\n\n"}
            The exchange functions employed ensure CLIMB tokens are entirely
            decentralized. There are no Liquidity Pool pairings that are needed
            to be locked or controlled by a centralized entity or owner address.
            The design schematic is engineered in such a way to improve overall
            functionality, return on investment, and security of investment for
            the end user.{"\n\n"}All owner functions within the contracts are
            renounced except one, and that is the ability to change the taxes
            from <span className="text-primary">5%</span> to a lower percentage.
            This owner function gives the ability to have promotions for
            marketing purposes offering entry into CLIMB with a lower tax
            structure. There is no callable owner function existing that can
            negatively affect the contract functionality or value of assets.
          </p>
          <h3 className="w-full max-w-4xl py-6 text-center text-lg font-bold uppercase text-primary">
            Explanation of why CLIMB will exist exclusively in the Binance
            Wealth Matrix
          </h3>
          <p className="max-w-4xl whitespace-pre-wrap pb-12 text-justify">
            While CLIMB is a brilliant concept with game-changing tech behind
            it, it needs transactions in order to rise. If CLIMB were available
            through a simple Swapper contract without the MATRIX, there would be
            very little price action, since most investors would choose to buy
            and hold. After perhaps an initial flurry of purchases upon launch,
            the price increases would stagnate relatively quickly.{"\n\n"}By
            making CLIMB exist only in the BWM, investors are given the
            opportunity to reinvest or redeem up to{" "}
            <span className="text-primary">3%</span> per day of their total
            investment.{"\n\n"}Whether reinvested or redeemed, each transaction
            within the BWM will increase the price of CLIMB. Eventually there
            could be hundreds if not thousands or tens of thousands of
            transactions per day, each and every one of them increasing the
            price of CLIMB.{"\n\n"}So while each investor&apos;s TVL score will
            rise and fall based on the actions of the totality of investors, the
            price of CLIMB will always rise. It is our belief that the constant
            increase in the price of CLIMB will help offset or negate temporary
            decreases in total contract value.
          </p>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default ClimbPage;
