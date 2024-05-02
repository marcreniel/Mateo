import type { Metadata } from "next";
import {Providers} from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mateo",
  description: "Your AI-powered email sidekick",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className='light'>
        <body>
        <Providers>
          {children}
        </Providers>
        </body>
      </html>
  );
}
