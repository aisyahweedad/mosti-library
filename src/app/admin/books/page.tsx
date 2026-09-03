import type { Metadata } from "next";

import { BooksTable } from "@/components/admin/books-table";

export const metadata: Metadata = {
  title: "Senarai Buku",
};

export default function BooksPage() {
  return <BooksTable />;
}
