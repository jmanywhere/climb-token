import { AiFillTwitterCircle } from "react-icons/ai";
import { BsTelegram } from "react-icons/bs";
import Image from "next/image";
import solidLogo from "../../public/assets/solidproof_logo.svg";

const Footer = () => {
  return (
    <footer className=" flex flex-col items-center justify-center gap-6 bg-black/20 py-8 md:flex-row">
      <div>
        <a
          href="https://t.me/BinanceWealthMatrix"
          target="_blank"
          rel="noreferrer"
          className="flex min-w-[208px] flex-row items-center justify-between gap-x-4 whitespace-pre-wrap rounded-xl border-2 border-primary px-4 py-3 font-mono hover:bg-primary hover:text-black"
        >
          Join our{"\n"}Telegram!
          <BsTelegram className="rounded-full bg-white text-4xl text-primary" />
        </a>
      </div>
      <div>
        <a
          href="https://t.me/BinanceWealthMatrix"
          target="_blank"
          rel="noreferrer"
          className="flex min-w-[208px] flex-row items-center justify-between gap-x-4 whitespace-pre-wrap rounded-xl border-2 border-primary px-4 py-3 font-mono hover:bg-primary hover:text-black"
        >
          <div>Follow us on{"\n"}Twitter</div>
          <AiFillTwitterCircle className="rounded-full bg-white text-4xl text-primary" />
        </a>
      </div>
      <div>
        <a
          href="https://github.com/solidproof/projects/tree/main/Binance%20Wealth%20Matrix"
          target="_blank"
          rel="noreferrer"
          className="flex min-w-[208px] flex-row items-center justify-between gap-x-4 whitespace-pre-wrap rounded-xl border-2 border-primary px-4 py-3 font-mono hover:bg-primary hover:text-black"
        >
          <div>Audited by{"\n"}Solidproof</div>
          <Image
            src={solidLogo as string}
            alt="solidproof logo"
            width={36}
            height={36}
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
