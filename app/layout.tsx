import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
// import { Inter } from "next/font/google";
// import { Montserrat } from "next/font/google";
// Prevent fontawesome from adding its CSS since we did it manually above:
//TODO: tirar google fonts, atrasa load por causa da vpn?
// const inter = Inter({ subsets: ["latin"] });
// const montserrat = Montserrat({
//    subsets: ["latin"],
//    fallback: ["Arial", "sans-serif"],
//  });
export const metadata: Metadata = {
  title: 'Calculadora de Despesas',
  description: 'Calculadora de despesas de viagem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
      {/* <!-- Favicon For all browsers --> */}
      <link rel="icon" type="image/png" sizes="32x32" href="https://conteudos.meo.pt/Style%20Library/consumo/images/favicons/favicon-32x32.png"></link>
      <link rel="icon" type="image/png" sizes="16x16" href="https://conteudos.meo.pt/Style%20Library/consumo/images/favicons/favicon-16x16.png"></link>
      {/* <!-- Favicon For Google and Android --> */}
      <link rel="icon" type="image/png" sizes="48x48" href="https://conteudos.meo.pt/Style%20Library/consumo/images/favicons/favicon-48x48.png"></link>
      <link rel="icon" type="image/png" sizes="192x192" href="https://conteudos.meo.pt/Style%20Library/consumo/images/favicons/favicon-192x192.png"></link>
      {/* <!-- Favicon For iPad --> */}
      <link rel="apple-touch-icon" type="image/png" sizes="167x167" href="https://conteudos.meo.pt/Style%20Library/consumo/images/favicons/favicon-167x167.png"></link>
      {/* <!-- Favicon For iPhone --> */}
      <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="https://conteudos.meo.pt/Style%20Library/consumo/images/favicons/favicon-180x180.png"></link>
      </head>
      <body className={` `}>
        <main>
          <Providers>
            {children}
          </Providers>
        </main>
       
      </body>
    </html>
  );
}
