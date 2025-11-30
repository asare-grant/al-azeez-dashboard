// import React from "react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupAction,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarSeparator,
// } from "@/components/ui/sidebar"
// // import { role } from "@/lib/data";
// import Link from "next/link";
// import Image from "next/image";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
// import { BookOpen, ChevronDown, ChevronUp, InfoIcon, User2 } from "lucide-react";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
// import { currentUser } from "@clerk/nextjs/server";

// const AppSidebar = async () => {

//   const user = await currentUser();
//   const role = user?.publicMetadata.role as string;

//   const menuItems = [
//         {
//           icon: "/home.png",
//           label: "Dashboard",
//           href: "/admin",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//           icon: "/teacher.png",
//           label: "Teachers",
//           href: "/list/teachers",
//           visible: ["admin", "teacher"]
//         },
//         {
//           icon: "/student.png",
//           label: "Students",
//           href: "/list/students",
//           visible: ["admin", "teacher"]
//         },
//         {
//           icon: "/parent.png",
//           label: "Parents",
//           href: "/list/parents",
//           visible: ["admin", "teacher"],
//         }
//     ]

//     const academics = [
        
//         {
//           icon: "/subject.png",
//           label: "Subjects",
//           href: "/list/subjects",
//           visible: ["admin"],
//         },
//         {
//             icon: "/class.png",
//             label: "Classes",
//             href: "/list/classes",
//             visible: ["admin", "teacher"],
//         },
//         {
//             icon: "/lesson.png",
//             label: "Lessons",
//             href: "/list/lessons",
//             visible: ["admin", "teacher"],
//         },
//         {
//             icon: "/exam.png",
//             label: "Exams",
//             href: "/list/exams",
//             visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//             icon: "/assignment.png",
//             label: "Assignments",
//             href: "/list/assignments",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//             icon: "/result.png",
//             label: "Results",
//             href: "/list/results",
//             visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//             icon: "/attendance.png",
//             label: "Attendance",
//             href: "/list/attendance",
//             visible: ["admin", "teacher", "student", "parent"],
//         },
//     ]
    
//     const finances = [
//         {
//             icon: "/attendance.png",
//             label: "Fees",
//             href: "/list/fee",
//             visible: ["admin"],
//         },
//         {
//           icon: "/subject.png",
//           label: "Fee Structure",
//           href: "/list/fee-structure",
//           visible: ["admin"],
//         },
//         {
//           icon: "/subject.png",
//           label: "Fee Type",
//           href: "/list/fee-type",
//           visible: ["admin"],
//         },
//         {
//           icon: "/subject.png",
//           label: "Fee Category",
//           href: "/list/fee-category",
//           visible: ["admin"],
//         },
//         {
//           icon: "/subject.png",
//           label: "Fee Master",
//           href: "/list/fee-master",
//           visible: ["admin"],
//         },
//         {
//           icon: "/subject.png",
//           label: "Fee Report",
//           href: "/list/fee-report",
//           visible: ["admin"],
//         },
//     ]
       
//     const informations = [

//         {
//           icon: "/calendar.png",
//           label: "Events",
//           href: "/list/events",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//           icon: "/announcement.png",
//           label: "Announcements",
//           href: "/list/announcements",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//           icon: "/message.png",
//           label: "Messages",
//           href: "/list/messages",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//     ]
    
//     const otherItems = [
//         {
//           icon: "/profile.png",
//           label: "Profile",
//           href: "/profile",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//           icon: "/setting.png",
//           label: "Settings",
//           href: "/settings",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//         {
//           icon: "/logout.png",
//           label: "Logout",
//           href: "/logout",
//           visible: ["admin", "teacher", "student", "parent"],
//         },
//       ]
    

//   return (
//     <Sidebar collapsible="icon">
//     {/* SIDEBAR HEADER */}
//       <SidebarHeader className="py-4">
//         <SidebarMenu>
//             <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                     <Link href="/">
//                         <Image src="/logo.jpg" alt="logo" width={24} height={24}/>
//                         <span>Al-Azeez International School</span>
//                     </Link>
//                 </SidebarMenuButton>
//             </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       {/* SIDEBAR SEPARATOR */}
//       <SidebarSeparator />
//       <SidebarContent>
//         {/* HOME MENU */}
//         <SidebarGroup>
//             <SidebarGroupLabel>Home Menu</SidebarGroupLabel>
//             <SidebarGroupContent>
//                 <SidebarMenu>
//                     {menuItems.map((menuItem) => {
                
//                       if(menuItem.visible.includes(role)) return(
//                         <SidebarMenuItem key={menuItem.label}>
//                             <SidebarMenuButton asChild>
//                                 <Link href={menuItem.href} className="flex items-center gap-3">
//                                     <img src={menuItem.icon} alt={menuItem.label} className="w-4 h-4"/>
//                                     <span>{menuItem.label}</span>
//                                 </Link>
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     )})}
//                 </SidebarMenu>
//             </SidebarGroupContent>
//         </SidebarGroup>
//         {/* ACADEMICS */}
//         <SidebarGroup>
//           <SidebarGroupLabel>Academics</SidebarGroupLabel>
//           <SidebarGroupAction>
//             <BookOpen/> <span className="sr-only">Academics</span>
//           </SidebarGroupAction>
//           <SidebarGroupContent>
//             <SidebarMenu>
//                     {academics.map((academic) => {
                
//                       if(academic.visible.includes(role)) return(
//                         <SidebarMenuItem key={academic.label}>
//                             <SidebarMenuButton asChild>
//                                 <Link href={academic.href} className="flex items-center gap-3">
//                                     <img src={academic.icon} alt={academic.label} className="w-4 h-4"/>
//                                     <span>{academic.label}</span>
//                                 </Link>
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     )})} 
//                 </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//         {/* COLLAPSIBLE */}
//         <Collapsible defaultOpen className="group/collapsible">
//           <SidebarGroup>
//             <SidebarGroupLabel asChild>
//               <CollapsibleTrigger>
//                 Finance
//                 <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"/>
//               </CollapsibleTrigger>
//             </SidebarGroupLabel>
//             <CollapsibleContent>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                     {finances.map((finance) => {
                
//                       if(finance.visible.includes(role)) return(
//                         <SidebarMenuItem key={finance.label}>
//                             <SidebarMenuButton asChild>
//                                 <Link href={finance.href} className="flex items-center gap-3">
//                                     <img src={finance.icon} alt={finance.label} className="w-4 h-4"/>
//                                     <span>{finance.label}</span>
//                                 </Link>
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     )})} 
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </CollapsibleContent>
//           </SidebarGroup>
//         </Collapsible>
//         {/* INFORMATION */}
//         <SidebarGroup>
//           <SidebarGroupLabel>Information</SidebarGroupLabel>
//           <SidebarGroupAction>
//             <InfoIcon/> <span className="sr-only">Information</span>
//           </SidebarGroupAction>
//           <SidebarGroupContent>
//             <SidebarMenu>
//                     {informations.map((information) => {
                
//                       if(information.visible.includes(role)) return(
//                         <SidebarMenuItem key={information.label}>
//                             <SidebarMenuButton asChild>
//                                 <Link href={information.href} className="flex items-center gap-3">
//                                     <img src={information.icon} alt={information.label} className="w-4 h-4"/>
//                                     <span>{information.label}</span>
//                                 </Link>
//                             </SidebarMenuButton>
//                         </SidebarMenuItem>
//                     )})} 
//                 </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//       {/* SIDEBAR FOOTER */}
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton>
//                   <User2 /> John Doe <ChevronUp className="ml-auto"/>
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>Account</DropdownMenuItem>
//                 <DropdownMenuItem>Setting</DropdownMenuItem>
//                 <DropdownMenuItem>Sign out</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// };

// export default AppSidebar;

// src/components/AppSidebar.tsx
import { currentUser } from "@clerk/nextjs/server";
import AppSidebarClient from "./AppSidebarClient";

export default async function AppSidebar() {
  const user = await currentUser();

  const role = (user?.publicMetadata.role as string) || "guest";
  const name = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.username || "Unknown User";
  const imageUrl = user?.imageUrl || "/noAvatar.png"; // fallback avatar

  // return <AppSidebarClient role={role} name={name} />;
  return <AppSidebarClient role={role} name={name} imageUrl={imageUrl} />;
}

