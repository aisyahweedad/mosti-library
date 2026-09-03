"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().min(1, "E-mel diperlukan").email("Format e-mel tidak sah"),
  password: z.string().min(8, "Kata laluan sekurang-kurangnya 8 aksara"),
});

type FormValues = z.infer<typeof schema>;

const DEMO_EMAIL = "admin@arkib.gov.my";
const DEMO_PASSWORD = "arkib2024";

export function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin/dashboard";

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.status === 401) {
        toast.error("E-mel atau kata laluan salah");
        return;
      }
      if (res.status !== 200) {
        toast.error(data.error ?? "Gagal log masuk. Cuba lagi.");
        return;
      }
      toast.success(`Selamat kembali, ${data.user.name.split(" ")[0]}!`);
      router.replace(from);
      router.refresh();
    } catch {
      toast.error("Ralat rangkaian. Cuba sekali lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-mel institusi</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="anda@institusi.gov.my"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Kata laluan</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
        Demo:{" "}
        <button
          type="button"
          className="font-medium text-primary underline underline-offset-2"
          onClick={() => {
            setValue("email", DEMO_EMAIL, { shouldValidate: true });
            setValue("password", DEMO_PASSWORD, { shouldValidate: true });
          }}
        >
          isikan kredensial demo
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={submitting} size="lg">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sedang log masuk…
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Log masuk
          </>
        )}
      </Button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
