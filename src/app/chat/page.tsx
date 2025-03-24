import React from "react";
import BaseLayout from "@/layouts/BaseLayout";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BaseLayout>
        <div>
          {/* Add your chat interface content here */}
        </div>
      </BaseLayout>
    </ThemeProvider>
  );
}