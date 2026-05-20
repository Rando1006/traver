import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "福岡之旅",
  description: "讓三個家庭一起整理候選行程並同步彙整 final 行程。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
