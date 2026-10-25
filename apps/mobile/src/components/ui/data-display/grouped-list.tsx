import React from 'react';
import { View, SectionList } from 'react-native';
import { Text } from '../primitives/text';
import { Skeleton } from '../feedback/skeleton';
import { EmptyState, EmptyStateProps } from '../feedback/empty-state';
import { cn } from '@/libs/utils';

export interface GroupedSection<T> {
  title: string;
  data: T[];
}

export interface GroupedListProps<T> {
  /**
   * Grouped sections.
   */
  sections: GroupedSection<T>[];

  /**
   * Render function for each item in a section.
   */
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement | null;

  /**
   * Key extractor for items.
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Whether list data is actively loading.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Skeleton placeholder count to render when isLoading is true.
   * @default 4
   */
  skeletonCount?: number;

  /**
   * Empty state props when sections data is empty.
   */
  emptyState?: EmptyStateProps;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * GroupedList provides a standardized SectionList wrapper with sticky headers,
 * zero-shift shimmer skeletons during load, and integrated empty states.
 *
 * Implements Excel Data Display #53.
 *
 * @param props - GroupedListProps
 * @returns React.JSX.Element
 */
export function GroupedList<T>({
  sections,
  renderItem,
  keyExtractor,
  isLoading = false,
  skeletonCount = 4,
  emptyState,
  className,
}: GroupedListProps<T>): React.JSX.Element {
  if (isLoading) {
    return (
      <View className={cn('p-4 flex-col gap-3', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <View key={`skel-row-${i}`} className="flex-row items-center gap-3">
            <Skeleton width={40} height={40} rounded="md" />
            <View className="flex-1 flex-col gap-1.5">
              <Skeleton width="65%" height={16} rounded="sm" />
              <Skeleton width="40%" height={12} rounded="sm" />
            </View>
            <Skeleton width={50} height={16} rounded="sm" />
          </View>
        ))}
      </View>
    );
  }

  const hasData = sections.some((s) => s.data && s.data.length > 0);

  if (!hasData && emptyState) {
    return <EmptyState {...emptyState} className={className} />;
  }

  return (
    <SectionList
      sections={sections as any}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      renderSectionHeader={({ section: { title } }: { section: { title: string } }) => (
        <View className="py-2 px-3 bg-kalya-canvas border-b border-kalya-border-subtle">
          <Text
            variant="caption"
            tone="secondary"
            className="font-inter-bold uppercase tracking-wider"
          >
            {title}
          </Text>
        </View>
      )}
      className={className}
    />
  );
}
