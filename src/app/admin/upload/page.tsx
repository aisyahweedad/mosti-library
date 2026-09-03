import type { Metadata } from "next";

import { UploadBookForm } from "@/components/admin/upload-book-form";

export const metadata: Metadata = {
  title: "Muat Naik Buku",
};

export default function UploadPage() {
  return <UploadBookForm />;
}
