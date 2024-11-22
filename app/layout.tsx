import React from "react";

import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Netmaker - Graph",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
         style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
