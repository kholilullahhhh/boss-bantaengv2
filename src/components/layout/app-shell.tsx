"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { navForRole } from "@/components/layout/nav";
import type { SessionUser } from "@/server/queries/session";

interface AppShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const items = navForRole(user.role);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar items={items} />
      <div className="lg:pl-64">
        <Header user={user} />
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-24 lg:p-6 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
