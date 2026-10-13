import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NexMeet",
  description: "Domain-specific meeting and scheduling platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}