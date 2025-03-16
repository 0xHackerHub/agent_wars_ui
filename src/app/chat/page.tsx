import React from "react";
import BaseLayout from "@/layouts/BaseLayout";
import HomePage from "./ChatPage";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BaseLayout>
        <HomePage />
      </BaseLayout>
    </ThemeProvider>
  );
}