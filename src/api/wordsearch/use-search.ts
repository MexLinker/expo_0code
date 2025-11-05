import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/api/common';
import type { SearchResponse } from './types';

type Variables = {
  q: string;
  table?: string;
  date?: string;
};
type Response = SearchResponse;

export const useSearch = createQuery<Response, Variables, AxiosError>({
  queryKey: ['search'],
  fetcher: (variables) =>
    client
      .get('search', { params: { q: variables.q, table: variables.table, date: variables.date } })
      .then((res) => res.data),
});