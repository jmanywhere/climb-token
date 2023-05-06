import { type AppType } from "next/dist/shared/lib/utils";
import { Roboto, Red_Hat_Mono } from "next/font/google";

import "@/styles/globals.css";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { bsc } from "wagmi/chains";

const chains = [bsc];
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing WalletConnect project ID");
}

const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const redHatMono = Red_Hat_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-red-hat-mono",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={`${redHatMono.variable}`}>
      <style jsx global>
        {`
          html {
            font-family: ${roboto.style.fontFamily};
          }
        `}
      </style>
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="dark"
      />
    </div>
  );
};

export default MyApp;
