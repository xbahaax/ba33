import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ba33 web-buyer",
  description: "Portail acheteur B2B pour consulter, verifier et commander les produits certifies NFN.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body className="font-sans antialiased">
        <Script id="ba33-theme-init" strategy="beforeInteractive">
          {`try { const savedTheme = localStorage.getItem("ba33-theme"); if (savedTheme === "dark") { document.documentElement.classList.add("dark"); } if (savedTheme === "light") { document.documentElement.classList.remove("dark"); } } catch (error) {}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
