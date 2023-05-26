import Header from "@/components/Header";
import { type NextPage } from "next";
import Head from "next/head";

const SoonPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Coming Soon - Binance Wealth Matrix</title>
        <meta
          name="description"
          content="BMW has stuff under construction and we couldn't possibly let go of the chance to inform you guys."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center pb-12">
          <h1 className="py-6 text-center text-4xl font-bold text-primary">
            Coming Soon!
          </h1>
          <ul className="max-w-4xl list-disc whitespace-pre-wrap text-justify text-white/90">
            <li className="px-4 py-2 text-lg font-semibold  marker:text-white/90">
              Money Market
            </li>
            <li className="px-4 py-2 text-lg font-semibold  marker:text-white/90">
              🤓 Games ? 🤓
            </li>
          </ul>
        </div>
      </main>
    </>
  );
};

export default SoonPage;
