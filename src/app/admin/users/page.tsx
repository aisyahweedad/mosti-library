import type { Metadata } from "next";

import { UsersList } from "@/components/admin/users-list";

export const metadata: Metadata = {
  title: "Pengguna",
};

export default function UsersPage() {
  return <UsersList />;
}
