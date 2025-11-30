"use server";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Moon, Settings, Sun, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import Themespage from "./Themespage";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";


const Navbar = async () => {
  const user = await currentUser();

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
          <span className="text-xs leading-3 font-medium">{user?.username}</span>
          <span className="text-[10px] text-gray-500 text-right">
            {/* Admin */}
            {user?.publicMetadata.role as string}
          </span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        {/*  USER MENU  */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="h-[1.2rem] w-[1.2rem] mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        <UserButton />
      </div>
      
    </div>
  );
};

export default Navbar;
