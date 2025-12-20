"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import Themespage from "./Themespage";
import { useEffect, useState } from "react";

interface NavbarClientProps {
  username: string;
  name: string;
  role: string;
  imageUrl: string;
}

const NavbarClient = ({
  username,
  name,
  role,
  imageUrl,
}: NavbarClientProps) => {
  
    
    const { signOut } = useClerk();
      const router = useRouter();
    
      const [loading, setLoading] = useState(false);
    
      const handleLogout = async () => {
        setLoading(true);
        await signOut();
        router.push("/sign-in");
      };
    
      const path = usePathname();
      useEffect(() => {
        console.log(path);
      }, [path]);

  return (
        <div className="flex items-center justify-between p-4">
      {/* LEFT SIDE */}
      <SidebarTrigger />
      {/* RIGHT SIDE (ICONS AND USER) */}
      <div className="flex items-center gap-4">
        {/* THEME MENU */}
        <Themespage />
        {/* MESSAGE AND NOTIFICATION MENU */}
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {username}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {/* Admin */}
            {role}
          </span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        {/*  USER MENU  */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full padding-[2px] bg-gray-100 w-[37] h-[37] flex items-center justify-center">
            <Avatar>
              <AvatarImage src={imageUrl} width={36} height={36} />
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} className="mx-4 w-[250]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="my-4">
              <Avatar>
                <AvatarImage src={imageUrl} width={36} height={36} />
                <AvatarFallback>UI</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 ">
                <p className="text-gray-600 font-medium">{name}</p>
                <span className="text-gray-400 text-xs">{role}</span>
              </div>
            </DropdownMenuItem>
            {role === "admin" && (
              <DropdownMenuItem>
                <Link
                  href="/list/settings/term"
                  className="flex gap-2 items-center text-gray-600"
                >
                  <Settings className="h-[1.2rem] w-[1.2rem] mr-2" /> Settings
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-[#f0b3b3]" onClick={handleLogout}>
              <LogOut
                className="h-[1.2rem] w-[1.2rem] mr-2"
                color="#f0b3b3e2"
              />
              Logout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="mt-4 flex items-center justify-center">
              <div className="border border-red p-px w-[17] h-[17]">
                <Image src="/logo.jpg" alt="" width={16} height={16} />
              </div>
              <p className="text-xs text-gray-300">
                Powered & Managed by{" "}
                <span className="text-xs text-[#CFCEFF]">AAIS</span>{" "}
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <UserButton /> */}
      </div>
    </div>
  );
};

export default NavbarClient;
