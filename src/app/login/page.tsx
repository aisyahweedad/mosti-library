import type { Metadata } from "next";
import { Landmark, LockKeyhole, Mail } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log Masuk Pentadbir",
  description:
    "Log masuk ke panel pentadbiran ARKIB untuk urus penyebaran tesis dan buku.",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-2xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <Landmark className="h-8 w-8" />
              <span className="font-display text-2xl font-bold tracking-tight">
                ARKIB
              </span>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-primary-foreground/80">
              Panel pentadbiran untuk pengurusan tesis dan buku kebangsaan —
              imbas OCR, urus metadata dan pantau penyebaran kandungan berasaskan
              AI.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-primary-foreground/90">
            <li className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 shrink-0" />
              Akses dihadkan kepada kakitangan berdaftar MOSTI dan institusi
              penyumbang.
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              Semua sesi dijana dengan token JWS dan tamat selepas 24 jam.
            </li>
          </ul>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Log masuk pentadbir
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan e-mel institusi dan kata laluan anda untuk meneruskan.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
