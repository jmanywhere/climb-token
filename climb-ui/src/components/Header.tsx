import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Web3Button } from "@web3modal/react";
import classNames from "classnames";
import { RxHamburgerMenu } from "react-icons/rx";
import { useMemo, useState } from "react";
import { useMatrixFetchData } from "@/data/matrixAtoms";
import { useMarketFetchData } from "@/data/marketAtoms";

const Header = () => {
  const router = useRouter();
  const [showNav, setShowNav] = useState(false);
  const isHome = useMemo(() => router.asPath === "/", [router.asPath]);
  useMatrixFetchData();
  useMarketFetchData();
  return (
    <header
      className={classNames(
        isHome ? "bg-transparent" : "bg-black/20",
        " px-6 py-4"
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        <nav className="flex flex-row items-center gap-x-6 text-lg">
          <div
            className={classNames(
              "flex flex-row items-center text-2xl font-bold text-primary",
              isHome ? "hidden" : "block"
            )}
          >
            <Image
              src="/assets/Logo.png"
              height={1920 / 10}
              width={1080 / 10}
              alt="BWM Logo"
            />
            <div className="hidden md:block">BWM</div>
          </div>
          <button>
            <RxHamburgerMenu
              className="text-2xl"
              onClick={() => setShowNav((p) => !p)}
            />
          </button>
          <Link
            href="/"
            className={classNames(
              router.asPath === "/"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden lg:block",
              isHome ? "text-base lg:text-lg" : "text-sm lg:text-base"
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
              "hidden md:block",
              isHome ? "text-base lg:text-lg" : "text-sm lg:text-base"
            )}
          >
            The Matrix
          </Link>
          {/* <Link
            href="/climb"
            className={classNames(
              router.asPath === "/climb"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block",
              isHome ? "text-base lg:text-lg" : "text-sm lg:text-base"
            )}
          >
            How Climb Works
          </Link> */}
          {/* <Link
            href="/soon"
            className={classNames(
              router.asPath === "/soon"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden lg:block",
              isHome ? "text-base lg:text-lg" : "text-sm lg:text-base"
            )}
          >
            Roadmap
          </Link> */}
          <Link
            href="/money-market"
            className={classNames(
              router.asPath === "/money-market"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block",
              isHome ? "text-base lg:text-lg" : "text-sm lg:text-base"
            )}
          >
            Money Market
          </Link>
          <Link
            href="/faq"
            className={classNames(
              router.asPath === "/faq"
                ? "font-semibold text-white "
                : "text-gray-500 hover:text-primary/80",
              "hidden md:block",
              isHome ? "text-base lg:text-lg" : "text-sm lg:text-base"
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
          "fixed bottom-0 top-0 z-20 flex w-full bg-black/20 backdrop-blur-sm transition-all duration-200 ease-in-out"
        )}
        onClick={(e) => {
          e.preventDefault();
          setShowNav(false);
        }}
      >
        <nav
          className={classNames(
            "flex w-[70%] max-w-sm flex-col bg-base-100 transition-all duration-300 ease-in-out"
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
            href="/climb"
            className={classNames(
              router.asPath === "/climb"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            How $CLIMB Works
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
            href="/money-market"
            className={classNames(
              router.asPath === "/money-market"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            Money Market
          </Link>

          <Link
            href="/soon"
            className={classNames(
              router.asPath === "/soon"
                ? "font-semibold text-white "
                : "text-gray-400 hover:text-primary/80",
              "my-1 w-full bg-primary/20 py-3 text-center"
            )}
          >
            Roadmap
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
