import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ChatWidget from "./components/chatbot/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatBotify - AI-Powered Chatbot Platform",
  description: "Automate your customer support with AI-powered chatbots across multiple channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
