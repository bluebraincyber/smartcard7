"use client";

import { MenuIcon } from "lucide-react";
// import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// import { UserAccountNav } from "@/components/layout/user-account-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
// import { useUser } from "@clerk/nextjs";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-transparent p-2">
      {/* <span>Topbar Placeholder</span> */}
      <div className="container flex h-12 items-center justify-between py-2">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="self-center w-10 h-10 flex items-center justify-center p-0 text-base bg-white rounded-full shadow-md hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:ring-0 md:hidden"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 bg-transparent backdrop-blur-none">
              <MobileNav />
            </SheetContent>
          </Sheet>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-blue-500 text-sm font-medium">
            SmartCard
          </div>
        </div>
        <div className="flex items-center justify-end">
          <nav className="flex items-center">
            {/* {user ? (
              <UserAccountNav user={user} />
            ) : (
              <Link href="/login">
                <Button className="self-center" size="sm">Entrar</Button>
              </Link>
            )} */}
          </nav>
        </div>
      </div>
    </header>
  );
}
