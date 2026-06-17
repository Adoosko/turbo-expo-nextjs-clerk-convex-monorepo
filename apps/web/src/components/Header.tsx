"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Logo from "./common/Logo";
import { UserNav } from "./common/UserNav";
import { usePathname } from "next/navigation";

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
};

const navigation: NavigationItem[] = [
  { name: "Benefits", href: "#Benefits", current: true },
  { name: "Reviews", href: "#reviews", current: false },
];

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="w-full sticky top-3 sm:top-4 z-30 px-3 sm:px-4">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl bg-white/90 backdrop-blur-md rounded-2xl py-3 px-4 sm:px-6 flex items-center justify-between h-18 border-none shadow-none">
            <div className="flex sm:hidden shrink-0 items-center">
              <Logo isMobile={true} />
            </div>
            <div className="sm:flex hidden shrink-0 items-center">
              <Logo />
            </div>
            {pathname === "/" && (
              <div className="flex flex-1 items-center justify-center">
                <div className="hidden sm:ml-6 sm:block">
                  <ul className="flex space-x-12">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-[#2D2D2D] hover:text-accent-primary text-base font-semibold transition"
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {user ? (
              <div className="hidden sm:flex gap-4 items-center">
                <Link href="/notes">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-base font-semibold border-none cursor-pointer hover:bg-accent-primary/95 transition"
                  >
                    See your Notes
                  </button>
                </Link>
                <UserNav
                  image={user?.imageUrl}
                  name={user?.fullName ?? "Account"}
                  email={user?.primaryEmailAddress?.emailAddress ?? ""}
                />
              </div>
            ) : (
              <div className="hidden sm:flex gap-3 items-center">
                <Link
                  href="/notes"
                  className="px-5 py-2.5 rounded-xl text-[#2D2D2D] hover:bg-bg-base/60 text-base font-semibold border-none cursor-pointer transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/notes"
                  className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-base font-semibold border-none cursor-pointer hover:bg-accent-primary/95 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
            <div className="block sm:hidden">
              {/* Mobile menu button*/}
              <DisclosureButton className="relative inline-flex items-center justify-center rounded-xl p-2 text-text-muted hover:bg-bg-base/60 transition focus:outline-hidden">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </DisclosureButton>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden mt-2 p-4 bg-white/95 backdrop-blur-md rounded-2xl border-none shadow-none flex flex-col gap-3 items-stretch animate-fade-in">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as={Link}
                href={item.href}
                className="text-[#2D2D2D] hover:text-accent-primary text-base font-semibold px-3 py-2 rounded-xl hover:bg-bg-base/40 transition"
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </DisclosureButton>
            ))}
            <div className="h-[1px] bg-bg-base/60 my-1 w-full" />
            {user ? (
              <Link
                href="/notes"
                className="w-full text-center px-5 py-2.5 rounded-xl bg-accent-primary text-white text-base font-semibold border-none cursor-pointer hover:bg-accent-primary/95 transition"
              >
                See your Notes
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/notes"
                  className="w-full text-center px-5 py-2.5 rounded-xl text-[#2D2D2D] hover:bg-bg-base/60 text-base font-semibold border-none cursor-pointer transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/notes"
                  className="w-full text-center px-5 py-2.5 rounded-xl bg-accent-primary text-white text-base font-semibold border-none cursor-pointer hover:bg-accent-primary/95 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
