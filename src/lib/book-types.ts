export type BookStatus =
  | "Siap"
  | "Dimuat Naik"
  | "Sedang Diproses"
  | "Menunggu"
  | "Gagal";

export type BookKind = string;

export type BookLanguage = "BM" | "EN" | "AR";

export const BOOK_STATUSES: BookStatus[] = [
  "Siap",
  "Dimuat Naik",
  "Sedang Diproses",
  "Menunggu",
  "Gagal",
];

export const BOOK_LANGUAGES: BookLanguage[] = ["BM", "EN", "AR"];

export type Book = {
  id: string;
  call: string;
  title: string;
  author: string;
  year: number;
  kind: BookKind;
  category: string;
  language: BookLanguage;
  pages: number;
  sizeMB: number;
  status: BookStatus;
  progress: number;
  uploadedAt: string;
  collatedBy: string;
  objectKey: string | null;
  abstract: string;
  keywords: string[];
  university: string;
  degree: string;
  faculty: string;
};

export type NewBookInput = {
  title: string;
  author: string;
  year: number;
  kind: BookKind;
  category: string;
  language: BookLanguage;
  pages: number;
  sizeMB: number;
};

export const MONTHLY_UPLOADS = [
  { month: "Jun", value: 8 },
  { month: "Jul", value: 11 },
  { month: "Ogos", value: 15 },
  { month: "Sep", value: 10 },
  { month: "Okt", value: 17 },
  { month: "Nov", value: 22 },
  { month: "Dis", value: 14 },
];
