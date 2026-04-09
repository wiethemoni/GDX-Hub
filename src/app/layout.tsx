import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "GDX Hub - ETF 투자 협업 및 분석",
  description: "금광주 레버리지(GDXU) 및 인버스(GDXY) ETF 투자를 위한 팀 협업 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark h-full">
      <body suppressHydrationWarning={true} className="antialiased flex h-full overflow-hidden bg-background text-foreground">
        <Navigation />
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
          <div className="flex-1 overflow-y-auto w-full p-8 relative">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
