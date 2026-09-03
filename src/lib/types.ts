export type Thesis = {
  id: string;
  call: string;
  faculty: string;
  title: string;
  author: string;
  university: string;
  degree: string;
  year: number;
  pages: number;
  ocrPages: number;
  ocrAccuracy: string;
  abstract: string;
  keywords: string[];
};

export type ThesisSummary = Pick<
  Thesis,
  | "id"
  | "call"
  | "faculty"
  | "title"
  | "author"
  | "university"
  | "year"
  | "pages"
  | "ocrAccuracy"
  | "keywords"
>;

export type SearchResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
