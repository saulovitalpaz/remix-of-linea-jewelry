import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Great_Vibes } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-romantic",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-clean",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Chique Detalhes | Acessórios & Semijoias",
  description: "Quiosque romântico e clean com linha infantil e feminina de bolsas e acessórios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${montserrat.variable} ${greatVibes.variable}`}>
        {children}
      </body>
    </html>
  );
}
