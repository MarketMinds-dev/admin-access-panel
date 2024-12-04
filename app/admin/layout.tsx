"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationBar from "@/components/navbar";
import { StyledSidebar } from "@/components/side-bar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, FileDown } from "lucide-react";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileDown,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <StyledSidebar items={sidebarNavItems} />
        <SidebarInset className="flex flex-col flex-1">
          <NavigationBar />
          <ScrollArea className="flex-1">
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
