import React from 'react';

import { FocusAwareStatusBar, Button, Input, ScrollView, Text, View, List, EmptyList, Select } from '@/components/ui';
import { hydrateApiBaseUrl, getApiBaseUrl, setApiBaseUrl } from '@/api/common/base-url';
import { useTables, useSearch, useRows } from '@/api/wordsearch';

export default function Data() {
  const [ip, setIp] = React.useState<string>(() => extractHost(getApiBaseUrl()) ?? '121.4.251.254');
  const [port, setPort] = React.useState<string>(() => extractPort(getApiBaseUrl()) ?? '5035');
  const baseUrl = React.useMemo(() => `http://${ip}:${port}/`, [ip, port]);
  const [testing, setTesting] = React.useState<boolean>(false);
  const [testMessage, setTestMessage] = React.useState<string>('');

  React.useEffect(() => {
    hydrateApiBaseUrl();
  }, []);

  const { data: tables } = useTables({ variables: undefined });
  const [selectedTable, setSelectedTable] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (tables?.tables?.length && !selectedTable) {
      setSelectedTable(tables.tables[0]);
    }
  }, [tables, selectedTable]);

  const [q, setQ] = React.useState('');
  const searchQuery = useSearch({
    variables: { q, table: selectedTable },
    enabled: q.trim().length > 0,
  });

  const rowsQuery = useRows({ variables: { limit: 50, table: selectedTable }, enabled: q.trim().length === 0 });

  const onSaveBaseUrl = async () => {
    setApiBaseUrl(baseUrl);
    setTesting(true);
    setTestMessage('Testing...');
    try {
      const res = await fetch(`${baseUrl}rows?limit=5`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTestMessage(`Connected: table=${json.table}, rows=${json.rows?.length ?? 0}`);
    } catch (e: any) {
      setTestMessage(`Connection failed: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const options = (tables?.tables ?? []).map((t) => ({ value: t, label: t }));

  const results = q.trim().length > 0 ? searchQuery.data?.rows ?? [] : rowsQuery.data?.rows ?? [];
  const isLoading = q.trim().length > 0 ? searchQuery.isPending : rowsQuery.isPending;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <View className="flex-1 pt-16">
          <Text className="text-xl font-bold">Data Explorer</Text>

          <View className="mt-4">
            <Text className="pb-2 text-lg">Connection</Text>
            <Input label="IP / Host" value={ip} onChangeText={setIp} autoCapitalize="none" testID="ip-input" />
            <Input label="Port" value={port} onChangeText={setPort} keyboardType="numeric" testID="port-input" />
            <Text className="pb-2 text-sm text-neutral-500">Base URL: {baseUrl}</Text>
            <Button label={testing ? 'Testing...' : 'Save & Test'} onPress={onSaveBaseUrl} disabled={testing} />
            {testMessage ? <Text className="pt-2 text-neutral-600">{testMessage}</Text> : null}
          </View>

          <View className="mt-6">
            <Text className="pb-2 text-lg">Table</Text>
            <Select
              options={options}
              value={selectedTable}
              onSelect={(value) => setSelectedTable(String(value))}
              placeholder="Select table"
            />
          </View>

          <View className="mt-6">
            <Text className="pb-2 text-lg">Search by Lemma</Text>
            <Input label="Query" value={q} onChangeText={setQ} autoCapitalize="none" testID="search-input" />
          </View>

          <View className="mt-6">
            <Text className="pb-2 text-lg">Results</Text>
            {results.length === 0 ? (
              <EmptyList isLoading={isLoading} />
            ) : (
              <List
                data={results}
                keyExtractor={(item: any, index) => String(item.id ?? index)}
                estimatedItemSize={120}
                renderItem={({ item }: { item: any }) => <RowCard item={item} />}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function RowCard({ item }: { item: any }) {
  const lemma = safeString(item?.Lemma);
  const summary = safeString(item?.Summary ?? item?.explain ?? item?.defination);
  const definition = safeString(item?.defination ?? item?.explain);
  return (
    <View className="m-2 overflow-hidden rounded-xl border border-neutral-300 bg-white p-3 dark:bg-neutral-900">
      <Text className="text-xl font-semibold">{lemma || 'Untitled'}</Text>
      {summary ? <Text className="pt-1 text-neutral-700 dark:text-neutral-200">{summary}</Text> : null}
      {definition ? <Text className="pt-1 text-neutral-600">{definition}</Text> : null}
      <Text className="pt-2 text-xs text-neutral-400">ID: {String(item?.id ?? '—')}</Text>
    </View>
  );
}

function safeString(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function extractHost(url?: string): string | null {
  try {
    if (!url) return null;
    const u = new URL(url);
    return u.hostname;
  } catch {
    return null;
  }
}

function extractPort(url?: string): string | null {
  try {
    if (!url) return null;
    const u = new URL(url);
    return u.port || '80';
  } catch {
    return null;
  }
}