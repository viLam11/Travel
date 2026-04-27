// src/components/layouts/UserLayout.tsx
import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "@/components/common/layout/NavigationUser";
import AIChatWidget from "@/components/chat/AIChatWidget";

const UserLayout: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="w-full">
        <Outlet />
      </main>
      <AIChatWidget />
    </div>
  );
};

export default UserLayout;