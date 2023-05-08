import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { matrixData } from "@/data/matrixAtoms";
import { BigNumber } from "ethers";
import { commify, formatEther } from "ethers/lib/utils.js";
import { useAtomValue } from "jotai";
import { type NextPage } from "next";
import wave from "../../public/assets/highlights/wave.png";
import stack from "../../public/assets/highlights/stack.png";
import triangle from "../../public/assets/highlights/triangle.png";
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
      <main className="flex min-h-screen flex-col bg-black">
        <Header />
        <div className=" sparks-bg flex w-full flex-col items-center">
          <div className="flex flex-col items-center">
            <Image
              src="/assets/Home Page Logo.png"
              alt="BWM Logo"
              height={1080 / 2.5}
              width={1920 / 2.5}
            />
            <h1 className="whitespace-pre-wrap pt-6 text-center text-6xl tracking-wider text-white/80">
              The exclusive home{"\n"}
              of <strong className="text-white">CLIMB</strong> token
            </h1>
          </div>
        </div>
        <section className="py-12">
          <ClimbPriceShow />
        </section>
        <section className="flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-12 md:flex-row">
          <div className="flex h-[300px] w-[280px] flex-col items-center rounded-lg border-2 border-primary px-6 py-8 text-center">
            <div className="relative h-[160px] w-[180px]">
              <Image src={stack} alt="Our actions" fill />
            </div>
            <h4 className="whitespace-pre-wrap pt-6 text-center tracking-wider">
              Invest, Reinvest, Redeem.{"\n"}Price rises on each tx.
            </h4>
          </div>
          <div className="flex h-[300px] w-[280px] flex-col items-center rounded-lg border-2 border-primary px-6 py-8 text-center">
            <div className="relative h-[160px] w-full">
              <Image src={wave} alt="Our collateralization" fill />
            </div>
            <h4 className="whitespace-pre-wrap pt-6 text-center tracking-wider">
              Fully collateralized{"\n"}with USDT and BUSD.
            </h4>
          </div>
          <div className="flex h-[300px] w-[280px] flex-col items-center rounded-lg border-2 border-primary px-6 py-8 text-center">
            <div className="relative h-[160px] w-full">
              <Image src={triangle} alt="Our offer" fill />
            </div>
            <h4 className="whitespace-pre-wrap pt-6 text-center tracking-wider">
              Passive income generator.{"\n"} Asset that never depreciates.
            </h4>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Home;

const ClimbPriceShow = () => {
  const md = useAtomValue(matrixData);

  return (
    <>
      <h2 className="text-center text-2xl tracking-wider">
        CLIMB starting price: <span className="text-primary">$ 1.00</span>
      </h2>
      <h3 className="whitespace-pre-wrap text-center text-2xl tracking-wider sm:whitespace-normal">
        CLIMB current price:{"\n"}
        <span className="text-primary">
          ${" "}
          {commify(
            parseFloat(
              formatEther(md.climbPrice || BigNumber.from("0"))
            ).toFixed(10)
          )
            .split(".")
            .map((v, i) => (i == 1 && parseInt(v) == 0 ? "0000000000" : v))
            .join(".")}
        </span>
      </h3>
    </>
  );
};
