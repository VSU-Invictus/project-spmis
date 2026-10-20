import { useQuery, type UseQueryOptions, type QueryClient } from '@tanstack/react-query';

export const NAVIGATION_CACHE_TIME = 1000 * 60 * 5; // 5 minutes
export const NAVIGATION_GC_TIME = 1000 * 60 * 30; // 30 minutes

export interface NavigationCacheConfig {
  staleTime?: number;
  gcTime?: number;
}

/**
 * Standard query configuration for route/navigation data caching.
 * Ensures initial fetch displays loading state once and subsequent revisits render instantly.
 */
export function getNavigationQueryOptions<TData = unknown>(
  key: readonly unknown[],
  queryFn: () => Promise<TData>,
  config?: NavigationCacheConfig
): UseQueryOptions<TData, Error, TData, readonly unknown[]> {
  return {
    queryKey: key,
    queryFn,
    staleTime: config?.staleTime ?? NAVIGATION_CACHE_TIME,
    gcTime: config?.gcTime ?? NAVIGATION_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
}

/**
 * Hook to consume cached route/navigation data with instant revisit guarantees.
 */
export function useNavigationData<TData>(
  key: readonly unknown[],
  queryFn: () => Promise<TData>,
  config?: NavigationCacheConfig
) {
  return useQuery(getNavigationQueryOptions(key, queryFn, config));
}

/**
 * Check if a specific navigation route or dataset is already cached in memory.
 */
export function isRouteDataCached(queryClient: QueryClient, key: readonly unknown[]): boolean {
  return queryClient.getQueryState(key)?.status === 'success';
}
