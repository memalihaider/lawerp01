import WebsiteHeader from "@/components/website/Header";
import WebsiteFooter from "@/components/website/Footer";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebsiteHeader />
      {children}
      <WebsiteFooter />
    </>
  );
}
