import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/api/common';
import type { RowResponse } from './types';

type Variables = {
  id: string | number;
  table?: string;
  date?: string;
};
type Response = RowResponse;

export const useRow = createQuery<Response, Variables, AxiosError>({
  queryKey: ['row'],
  fetcher: (variables) =>
    client
      .get(`rows/${variables.id}`, { params: { table: variables.table, date: variables.date } })
      .then((res) => res.data),
});