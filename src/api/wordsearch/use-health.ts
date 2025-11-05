import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/api/common';
import type { HealthResponse } from './types';

type Variables = void;
type Response = HealthResponse;

export const useHealth = createQuery<Response, Variables, AxiosError>({
  queryKey: ['health'],
  fetcher: () => client.get('health').then((res) => res.data),
});