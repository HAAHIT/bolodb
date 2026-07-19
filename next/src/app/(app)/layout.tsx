import { Navbar } from "@/components/shared/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>{children}</main>
    </>
  );
}
