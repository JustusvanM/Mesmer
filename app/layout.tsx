import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gomesmer.com"),
  title: "Mesmer: Climb the ranks | Verified MRR league for founders",
  description:
    "Compete in revenue-based leagues. Verified MRR. Monthly seasons. Climb to 100K.",
  icons: [{ url: "/logo-icon.png", type: "image/png" }],
  alternates: { canonical: "https://www.gomesmer.com" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
