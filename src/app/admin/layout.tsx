import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const token = cookies().get(SESSION_COOKIE)?.value ?? null;
  const user = await verifySession(token);

  if (!user) {
    redirect("/login?from=/admin/dashboard");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
