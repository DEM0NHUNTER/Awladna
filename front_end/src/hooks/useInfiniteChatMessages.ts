// src/hooks/useInfiniteChatMessages.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessagesPaginated } from "../api/chat";

/**
 * Custom hook to fetch chat messages with infinite scroll pagination.
 *
 * @param childId - Optional child profile ID to filter messages by.
 * @returns React Query infinite query object containing pages of messages and pagination helpers.
 */
export const useInfiniteChatMessages = (childId?: number) => {
  return useInfiniteQuery({
    // Unique query key includes childId to refetch when it changes
    queryKey: ["chat", childId],
    // Query function fetches a page of messages based on pageParam offset
    queryFn: ({ pageParam = 0 }) => fetchMessagesPaginated(childId!, pageParam),
    // Enable query only if childId is defined (truthy)
    enabled: !!childId,
    // Function to determine the next page offset, or undefined if no more pages
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined; // No more pages
      return pages.length * 20; // Next page offset = number of pages loaded * page size (20)
    },
    // Cache the data for 10 minutes before refetching
    staleTime: 1000 * 60 * 10,
  });
};
