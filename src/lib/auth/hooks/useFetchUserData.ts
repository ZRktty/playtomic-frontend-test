import { useCallback } from 'react';
import { useApiFetcher } from '@/lib/api';
import { User } from '@/lib/api-types';
import { UserData } from "@/lib/auth/types.ts";

/**
 * Hook for fetching authenticated user data from the API
 * @returns A function that accepts an access token and returns user data
 * @throws {Error} If the access token is missing or the request fails
 */
export const useFetchUserData = () => {
  const fetcher = useApiFetcher();

  return useCallback(async (accessToken?: string): Promise<UserData> => {
    const response = await fetcher('GET /v1/users/me', {}, {
      headers : { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(response.data.message);
    }

    const user: User = response.data;
    return {
      userId: user.userId,
      name: user.displayName,
      email: user.email ?? '',
    };
  }, [fetcher]);
};