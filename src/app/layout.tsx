import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Prompt Transformer App",
  description:
    "Transform simple prompts into structured JSON configurations for AI image generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
