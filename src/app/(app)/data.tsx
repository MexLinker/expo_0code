import React from 'react';

import {
  getApiBaseUrl,
  hydrateApiBaseUrl,
  setApiBaseUrl,
} from '@/api/common/base-url';
import { useRows, useSearch } from '@/api/wordsearch';
import {
  Button,
  EmptyList,
  FocusAwareStatusBar,
  Input,
  List,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

import { RowCard } from './data.parts';

function useBaseUrl() {
  const [ip, setIp] = React.useState<string>(
    () => extractHost(getApiBaseUrl()) ?? '121.4.251.254'
  );
  const [port, setPort] = React.useState<string>(
    () => extractPort(getApiBaseUrl()) ?? '5035'
  );
  const baseUrl = React.useMemo(() => `http://${ip}:${port}/`, [ip, port]);
  const [testing, setTesting] = React.useState<boolean>(false);
  const [testMessage, setTestMessage] = React.useState<string>('');

  React.useEffect(() => {
    hydrateApiBaseUrl();
  }, []);

  const onSaveBaseUrl = React.useCallback(async () => {
    setApiBaseUrl(baseUrl);
    setTesting(true);
    setTestMessage('Testing...');
    try {
      const res = await fetch(`${baseUrl}rows?limit=5`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTestMessage(
        `Connected: table=${json.table}, rows=${json.rows?.length ?? 0}`
      );
    } catch (e: any) {
      setTestMessage(`Connection failed: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  }, [baseUrl]);

  return {
    ip,
    setIp,
    port,
    setPort,
    baseUrl,
    testing,
    testMessage,
    onSaveBaseUrl,
  };
}

function useDataSource(q: string) {
  const searchQuery = useSearch({
    variables: { q },
    enabled: q.trim().length > 0,
  });

  const rowsQuery = useRows({
    variables: { limit: 50 },
    enabled: q.trim().length === 0,
  });

  const isSearching = q.trim().length > 0;
  const results = isSearching
    ? (searchQuery.data?.rows ?? [])
    : (rowsQuery.data?.rows ?? []);
  const isLoading = isSearching ? searchQuery.isPending : rowsQuery.isPending;
  const activeTable = isSearching
    ? searchQuery.data?.table
    : rowsQuery.data?.table;
  const onUpdated = isSearching
    ? () => searchQuery.refetch()
    : () => rowsQuery.refetch();

  return { results, isLoading, activeTable, onUpdated };
}

export default function Data() {
  return (
    <>
      <FocusAwareStatusBar />
      <DataScreen />
    </>
  );
}

function DataScreen() {
  const {
    ip,
    setIp,
    port,
    setPort,
    baseUrl,
    testing,
    testMessage,
    onSaveBaseUrl,
  } = useBaseUrl();
  const [q, setQ] = React.useState('');
  const { results, isLoading, activeTable, onUpdated } = useDataSource(q);
  return (
    <DataBody
      ip={ip}
      port={port}
      setIp={setIp}
      setPort={setPort}
      baseUrl={baseUrl}
      testing={testing}
      testMessage={testMessage}
      onSaveBaseUrl={onSaveBaseUrl}
      q={q}
      setQ={setQ}
      results={results}
      isLoading={isLoading}
      activeTable={activeTable}
      onUpdated={onUpdated}
    />
  );
}

function DataBody({
  ip,
  port,
  setIp,
  setPort,
  baseUrl,
  testing,
  testMessage,
  onSaveBaseUrl,
  q,
  setQ,
  results,
  isLoading,
  activeTable,
  onUpdated,
}: {
  ip: string;
  port: string;
  setIp: (v: string) => void;
  setPort: (v: string) => void;
  baseUrl: string;
  testing: boolean;
  testMessage: string;
  onSaveBaseUrl: () => void;
  q: string;
  setQ: (v: string) => void;
  results: any[];
  isLoading: boolean;
  activeTable?: string;
  onUpdated: () => void;
}) {
  return (
    <ScrollView className="px-4">
      <View className="flex-1 pt-16">
        <Text className="text-xl font-bold">Data Explorer</Text>
        <ConnectionSection
          ip={ip}
          port={port}
          setIp={setIp}
          setPort={setPort}
          baseUrl={baseUrl}
          testing={testing}
          testMessage={testMessage}
          onSaveBaseUrl={onSaveBaseUrl}
        />
        <SearchSection q={q} setQ={setQ} />
        <ResultsSection
          results={results}
          isLoading={isLoading}
          activeTable={activeTable}
          onUpdated={onUpdated}
        />
      </View>
    </ScrollView>
  );
}

function ConnectionSection({
  ip,
  port,
  setIp,
  setPort,
  baseUrl,
  testing,
  testMessage,
  onSaveBaseUrl,
}: {
  ip: string;
  port: string;
  setIp: (v: string) => void;
  setPort: (v: string) => void;
  baseUrl: string;
  testing: boolean;
  testMessage: string;
  onSaveBaseUrl: () => void;
}) {
  return (
    <View className="mt-4">
      <Text className="pb-2 text-lg">Connection</Text>
      <Input
        label="IP / Host"
        value={ip}
        onChangeText={setIp}
        autoCapitalize="none"
        testID="ip-input"
      />
      <Input
        label="Port"
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
        testID="port-input"
      />
      <Text className="pb-2 text-sm text-neutral-500">Base URL: {baseUrl}</Text>
      <Button
        label={testing ? 'Testing...' : 'Save & Test'}
        onPress={onSaveBaseUrl}
        disabled={testing}
      />
      {testMessage ? (
        <Text className="pt-2 text-neutral-600">{testMessage}</Text>
      ) : null}
    </View>
  );
}

function SearchSection({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <View className="mt-6">
      <Text className="pb-2 text-lg">Search by Lemma</Text>
      <Input
        label="Query"
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
        testID="search-input"
      />
    </View>
  );
}

function ResultsSection({
  results,
  isLoading,
  activeTable,
  onUpdated,
}: {
  results: any[];
  isLoading: boolean;
  activeTable?: string;
  onUpdated: () => void;
}) {
  return (
    <View className="mt-6">
      <Text className="pb-2 text-lg">Results</Text>
      {results.length === 0 ? (
        <EmptyList isLoading={isLoading} />
      ) : (
        <List
          data={results}
          keyExtractor={(item: any, index) => String(item.id ?? index)}
          estimatedItemSize={140}
          renderItem={({ item }: { item: any }) => (
            <RowCard item={item} table={activeTable} onUpdated={onUpdated} />
          )}
        />
      )}
    </View>
  );
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
