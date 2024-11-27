export interface Chapter {
  number: number;
  title: string;
  content: string;
}

export interface Embedding {
  id: string;
  values: number[];
  metadata: {
    source: string;
    book: number;
    section: number;
    text: string;
  };
}

export interface SearchResult {
  score: number;
  book: number;
  section: number;
  text: string;
  source: string;
}

export interface Section {
  book: number;
  number: number;
  content: string;
}
