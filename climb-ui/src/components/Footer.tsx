import { FaTelegramPlane } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className=" flex flex-col items-center justify-center bg-black/20 py-8">
      <div>
        <a
          href="https://t.me/BinanceWealthMatrix"
          target="_blank"
          rel="noreferrer"
          className="flex flex-row items-center rounded-xl px-4 py-3 hover:bg-primary hover:text-black"
        >
          <FaTelegramPlane className="text-xl" />
          &nbsp; Join our telegram!
        </a>
      </div>
    </footer>
  );
};

export default Footer;
