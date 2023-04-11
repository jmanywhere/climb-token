import Link from "next/link";
import { useRouter } from "next/router";
import { Web3Button } from "@web3modal/react";
import classNames from "classnames";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";

const Header = () => {
  const router = useRouter();
  const [showNav, setShowNav] = useState(false);
  return (
    <header className="bg-black/20 px-6 py-4">
      <div className="container mx-auto flex flex-row items-center justify-between">
        <nav className="flex flex-row items-center gap-x-6 text-lg">
          <button className="md:hidden">
            <RxHamburgerMenu
              className="text-2xl"
              onClick={() => setShowNav((p) => !p)}
            />
          </button>
          <div className="text-2xl font-bold text-primary">BWM</div>
          <Link
            href="/"
            className={classNames(
              router.asPath === "/"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block"
            )}
          >
            Home
          </Link>
          <Link
            href="/matrix"
            className={classNames(
              router.asPath === "/matrix"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block"
            )}
          >
            The Matrix
          </Link>
          <Link
            href="/climb"
            className={classNames(
              router.asPath === "/climb"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block"
            )}
          >
            $CLIMB Token
          </Link>
          <Link
            href="/faq"
            className={classNames(
              router.asPath === "/faq"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block"
            )}
          >
            FAQ
          </Link>
        </nav>
        <Web3Button />
      </div>
      <div
        className={classNames(
          showNav ? "left-0" : "-left-full",
          "fixed bottom-0 top-0 flex w-full bg-black/20 backdrop-blur-sm transition-all duration-200 ease-in-out md:hidden"
        )}
        onClick={(e) => {
          e.preventDefault();
          setShowNav(false);
        }}
      >
        <nav
          className={classNames(
            "flex w-[70%] flex-col bg-base-100 transition-all duration-300 ease-in-out"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full py-4 text-center text-2xl font-bold text-primary">
            BWM
          </div>
          <Link
            href="/"
            className={classNames(
              router.asPath === "/"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            Home
          </Link>
          <Link
            href="/matrix"
            className={classNames(
              router.asPath === "/matrix"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            The Matrix
          </Link>
          <Link
            href="/climb"
            className={classNames(
              router.asPath === "/climb"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            $CLIMB Token
          </Link>
          <Link
            href="/faq"
            className={classNames(
              router.asPath === "/faq"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
