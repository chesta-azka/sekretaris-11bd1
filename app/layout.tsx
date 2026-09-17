import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Sekretaris 11 BD 1",
  description: "Digitalisasi Absensi & Kesiapan Kelas 11 BD 1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="antialiased">
      <body className={`${inter.className} bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 dark:bg-zinc-950 dark:text-zinc-50 dark:selection:bg-emerald-900 dark:selection:text-emerald-50`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
