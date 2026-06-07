// src/components/layouts/UserLayout.tsx
import type { FC } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Navigation from "@/components/common/layout/NavigationUser";
import AIChatWidget from "@/components/chat/AIChatWidget";

const UserLayout: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Scroll to top on every navigation, restore position on back/forward */}
      <ScrollRestoration />
      <Navigation />
      <main className="w-full min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <AIChatWidget />
    </div>
  );
};

export default UserLayout;