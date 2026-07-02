import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "./providers";

export const metadata: Metadata = {
  title: "Annotation Activity Console",
  description: "Internal console for annotator task activity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
