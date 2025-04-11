import "@/styles/globals.css";
import { ReactFlowProvider } from "@xyflow/react";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { siteConfig } from "site";
import { create } from "zustand";

const useAgentwflowState = create((set) => ({
  nodes: [],
  edges: [],
  activeNode: null,
  consoleRef: null,
  sidebarRef: null,
  isConsoleOpen: false,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setActiveNode: (activeNode) => set({ activeNode }),
  setConsoleRef: (consoleRef) => set({ consoleRef }),
  setSidebarRef: (sidebarRef) => set({ sidebarRef }),
  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),
}));

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "AI Agent",
    "AI Agent on Aptos",
    "AgentW",
    "Aptos AI Agent",
    "DefAI AI Agent",
  ],
  authors: [
    {
      name: "Nisarg Thakkar",
      url: "https://www.nisargthakkar.co/",
    },
  ],
  creator: "Nisarg",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "Nisarg Thakkar",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <ReactFlowProvider>
        <body>{children}</body>
      </ReactFlowProvider>
    </html>
  );
}
