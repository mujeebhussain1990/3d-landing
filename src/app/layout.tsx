import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import SceneLoader from "@/components/three/SceneLoader";
import Nav from "@/components/Nav";
import "./globals.css";

// Brand faces from hashoneglobal.com: Plus Jakarta Sans for headings, Work Sans for text
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "HashOne Global — Ideas into Impact", template: "%s — HashOne Global" },
  description:
    "HashOne Global builds high-performing web, mobile, AI and cloud products from first idea to launch, across offices in Florida, Toronto, Dubai, Riyadh and Karachi.",
};

export const viewport: Viewport = {
  themeColor: "#05070e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body>
        <SmoothScroll />
        <SceneLoader />
        <Nav />
        {children}
      </body>
    </html>
  );
}
