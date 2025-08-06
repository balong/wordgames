import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

const baloo2 = Baloo_2({ 
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-baloo-2"
});

export const metadata: Metadata = {
  title: "Word Games",
  description: "A word puzzle game where you create words from letter tiles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable}`}>
        {children}
      </body>
    </html>
  );
}
