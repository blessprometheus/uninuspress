import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Uninus Press — Penerbitan Buku Universitas Islam Nusantara",
    template: "%s | Uninus Press",
  },
  description:
    "Uninus Press adalah penerbit universitas yang melayani penerbitan buku akademik, pendidikan, dan karya kreatif.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
