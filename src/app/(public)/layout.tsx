import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { PublicMain } from "@/components/public/public-main";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PublicMain>{children}</PublicMain>
      <SiteFooter />
    </div>
  );
}
