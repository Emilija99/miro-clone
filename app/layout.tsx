import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModalProvider } from "@/providers/modal-provider";
import { LiveblocksProvider } from "@/liveblocks.config";
import Provider from "./liveblocks-provider";
import { InboxPopover } from "./board/[boardId]/_components/inbox";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <Provider>
            <Toaster />
            <ModalProvider />

            {children}
          </Provider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
