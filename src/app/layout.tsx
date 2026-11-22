import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const satoshi = localFont({
  src: "../../Fonts/WEB/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noutch",
  description: "Noutch messaging workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
