import { Env } from '@env';
import { client } from './client';
import { getItem, setItem } from '@/lib/storage';

const KEY = 'API_BASE_URL';

export const getApiBaseUrl = (): string => {
  const stored = getItem<string>(KEY);
  return stored ?? Env.API_URL;
};

export const setApiBaseUrl = (url: string) => {
  setItem<string>(KEY, url);
  client.defaults.baseURL = url;
};

export const hydrateApiBaseUrl = () => {
  const base = getItem<string>(KEY);
  if (base) {
    client.defaults.baseURL = base;
  } else {
    client.defaults.baseURL = Env.API_URL;
  }
};