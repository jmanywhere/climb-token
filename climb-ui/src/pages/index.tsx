import Footer from "@/components/Footer";
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
          <div className="flex flex-col items-center justify-center md:flex-row">
            <Image
              src="/assets/Logo.png"
              alt="BWM Logo"
              height={200}
              width={200}
            />
            <h1 className="whitespace-pre-wrap pl-4 text-6xl font-bold uppercase tracking-widest text-primary">
              B<span className="text-yellow-500">inance</span>
              {"\n"}W<span className="text-white">ealth</span>
              {"\n"}M<span className="text-white">atrix</span>
            </h1>
          </div>
          <div className="text-2xl font-bold text-primary">
            Launching on May 13th, 2023
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Home;
