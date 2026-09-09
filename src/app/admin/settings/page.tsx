import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Tetapan",
};

export default function SettingsPage() {
  return <SettingsForm />;
}
