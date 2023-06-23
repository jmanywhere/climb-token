import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { NextPage } from "next";
import Head from "next/head";

const MoneyMarketPage: NextPage = () => {

  return <>
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
      <section className="sparks-bg mb-2 w-full py-16">
      <h1 className="pb-2 text-center text-4xl tracking-wide">
      <strong>M</strong>atrix <strong>M</strong>oney <strong>M</strong>arket
      </h1>
      <h2 className="animate-pulse whitespace-pre-wrap pb-6 text-center text-2xl md:whitespace-normal">
        Deposit. Liquidate.{"\n"}PROFIT.
      </h2>
      </section>
    <Footer />
    </main>
  </>
}

export default MoneyMarketPage;