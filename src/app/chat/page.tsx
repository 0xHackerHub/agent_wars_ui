import React from "react";
import BaseLayout from "@/layouts/BaseLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Chat } from "@/components/Chat";

export default function ChatPage() {
  // Hard-coded user address for testing
  const testUserAddress = "0xd5f91e397f816bc6826fd9f2e4fd3453d43ba9f418dbd65e5d4db51e0e7a92fd";
  
  return (
    <ThemeProvider defaultTheme="system">
      <BaseLayout>
        <div className="h-[calc(100vh-4rem)] p-4">
          <Chat userAddress={testUserAddress} />
        </div>
      </BaseLayout>
    </ThemeProvider>
  );
}