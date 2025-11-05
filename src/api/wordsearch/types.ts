export type WordRow = Record<string, string | number | null>;

export type TablesResponse = {
  tables: string[];
};

export type RowsResponse = {
  table: string;
  limit: number;
  offset: number;
  rows: WordRow[];
};

export type RowResponse = {
  table: string;
  row: WordRow | null;
};

export type SearchResponse = {
  table: string;
  q: string;
  rows: WordRow[];
};

export type HealthResponse = {
  status: string;
  port?: number;
  db?: string;
};

export type UpdateResponse = {
  table: string;
  updated: number;
};
