import Header from "@/components/Header";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Binance Wealth Matrix</title>
        <meta
          name="description"
          content="The Binance Wealth Matrix is a completely unique and first-of-its-kind passive income generator available only on the Binance Smart Chain (BSC)."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className=" flex h-full w-full flex-1 flex-col items-center justify-center">
          <Image
            src="/assets/Head.png"
            alt="BWM Head logo"
            height={865 / 3}
            width={651 / 3}
          />
          <div className="text-2xl font-bold text-primary">
            Relaunching Soon!
          </div>
        </div>
        <div className="flex flex-col bg-black/20 md:flex-row">footer</div>
      </main>
    </>
  );
};

export default Home;
