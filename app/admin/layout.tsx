"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationBar from "@/components/navbar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string;
    title: string;
  }[];
}

function Sidebar({ className, items, ...props }: SidebarProps) {
  return (
    <div className={`pb-12 ${className}`} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Admin Dashboard
          </h2>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.href}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarNavItems = [
    {
      title: "Overview",
      href: "/admin",
    },
    {
      title: "Cash Drawer",
      href: "/admin/cash-drawer",
    },
    {
      title: "Employee Detection",
      href: "/admin/employee-detection",
    },
    {
      title: "Door Status",
      href: "/admin/door-status",
    },
    {
      title: "People Counting",
      href: "/admin/people-counting",
    },
    {
      title: "Face Recognition",
      href: "/admin/face-recognition",
    },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavigationBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
          <ScrollArea className="h-full">
            <Sidebar items={sidebarNavItems} className="p-4" />
          </ScrollArea>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
