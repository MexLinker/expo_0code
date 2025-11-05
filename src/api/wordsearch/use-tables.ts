import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/api/common';
import type { TablesResponse } from './types';

type Variables = void;
type Response = TablesResponse;

export const useTables = createQuery<Response, Variables, AxiosError>({
  queryKey: ['tables'],
  fetcher: () => client.get('tables').then((res) => res.data),
});