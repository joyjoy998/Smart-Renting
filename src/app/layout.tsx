import { Roboto } from "next/font/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ClerkProvider } from "@clerk/nextjs";
import { InitializeApp } from "./InitializeApp";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Renting",
  description: "Explore locations with our interactive map application",
};

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} ${roboto.variable}`}>
          <AppRouterCacheProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <InitializeApp />
              {children}
              <Analytics />
            </ThemeProvider>
          </AppRouterCacheProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
