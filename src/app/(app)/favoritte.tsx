import React from 'react';

import { useRows } from '@/api/wordsearch';
import {
  EmptyList,
  FocusAwareStatusBar,
  List,
  Text,
  View,
} from '@/components/ui';

import { RowCard } from './favoritte.parts';

export default function Favoritte() {
  const rowsQuery = useRows({ variables: { limit: 200 }, enabled: true });
  const isLoading = rowsQuery.isPending;
  const activeTable = rowsQuery.data?.table;
  const rows = rowsQuery.data?.rows;
  const filtered = React.useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    return list.filter((r: any) => String(r?.['meet'] ?? '').trim().length > 0);
  }, [rows]);

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 px-4 pt-16">
        <Text className="text-xl font-bold">favoritte</Text>
        <Text className="pt-1 text-sm text-neutral-500">
          Table: {activeTable ?? '—'} | Count: {filtered.length}
        </Text>

        <View className="mt-6 flex-1">
          {filtered.length === 0 ? (
            <EmptyList isLoading={isLoading} />
          ) : (
            <List
              data={filtered}
              keyExtractor={(item: any, index) => String(item.id ?? index)}
              estimatedItemSize={140}
              renderItem={({ item }: { item: any }) => (
                <RowCard
                  item={item}
                  table={activeTable}
                  onUpdated={() => rowsQuery.refetch()}
                />
              )}
            />
          )}
        </View>
      </View>
    </>
  );
}

// RowCard and helpers were moved to './favoritte.parts' to satisfy lint rules.
