<<<<<<< HEAD
import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  variable: "--font-lexend-deca",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aegis",
  description: "Detect and prevent AI jailbreak attempts with advanced multi-layer detection",
  icons: {
    icon: "/small.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <link rel="icon" href="/small.png" type="image/png" />
      </head>
      <body
        className={`${lexendDeca.variable} antialiased bg-black font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
=======
import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  variable: "--font-lexend-deca",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aegis",
  description: "Detect and prevent AI jailbreak attempts with advanced multi-layer detection",
  icons: {
    icon: "/small.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body
        className={`${lexendDeca.variable} antialiased bg-black font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
>>>>>>> 2dfa63bb09b9dea0b1e7b40f7f8e901290c88c36
