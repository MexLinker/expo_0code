import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/api/common';
import type { RowsResponse } from './types';

type Variables = {
  limit?: number;
  offset?: number;
  table?: string;
  date?: string;
};
type Response = RowsResponse;

export const useRows = createQuery<Response, Variables, AxiosError>({
  queryKey: ['rows'],
  fetcher: (variables) =>
    client
      .get('rows', { params: variables })
      .then((res) => res.data),
});