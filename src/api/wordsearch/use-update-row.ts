import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '@/api/common';

import type { UpdateResponse } from './types';

type Variables = {
  id: string | number;
  data: Record<string, unknown>;
  table?: string;
  date?: string;
};
type Response = UpdateResponse;

export const useUpdateRow = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) => {
    try {
      const res = await client.put(`rows/${variables.id}`, variables.data, {
        params: { table: variables.table, date: variables.date },
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const methodNotAllowed = status === 405;
      const noResponse = !error?.response;
      // Fallback to POST ONLY when PUT is not allowed or network blocks the method
      if (methodNotAllowed || noResponse) {
        const res = await client.post(`rows/${variables.id}`, variables.data, {
          params: { table: variables.table, date: variables.date },
          headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
      }
      throw error;
    }
  },
});
