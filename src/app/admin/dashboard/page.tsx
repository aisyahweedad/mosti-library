import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardContent } from "@/components/admin/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
