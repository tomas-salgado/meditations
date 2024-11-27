export interface Chapter {
  number: number;
  title: string;
  content: string;
}

export interface Embedding {
  id: string;
  values: number[];
  metadata: {
    chapter: number;
    text: string;
  };
}

export interface SearchResult {
  score: number;
  chapter: number;
  text: string;
}
