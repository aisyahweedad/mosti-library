"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: string;
  active: boolean;
  joined: string;
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  "Pentadbir Sistem": "default",
  "Pemeriksa Metadata": "secondary",
  "Penyumbang Tesis": "outline",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function UsersList() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetch("/api/admin/users").then((r) => r.json()),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Pengguna Berdaftar</CardTitle>
          <CardDescription>
            Institusi penyumbang dan kakitangan yang diberi akses ke repositori.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {(data?.users ?? []).map((user: AdminUser) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email} · {user.institution}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      variant={
                        ROLE_VARIANT[user.role] ??
                        ROLE_VARIANT["Penyumbang Tesis"]
                      }
                      className="hidden sm:inline-flex"
                    >
                      {user.role}
                    </Badge>
                    <Switch
                      defaultChecked={user.active}
                      disabled
                      aria-label={`Aktif: ${user.name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
