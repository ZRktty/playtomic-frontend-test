import { useCallback, useEffect, useRef } from 'react';
import { useApiFetcher } from '@/lib/api';
import { TokensData } from '@/lib/auth/types';

export const shouldRefreshToken = (expiresAt: string): boolean => {
    const refreshBuffer = 5 * 60 * 1000; // 5 minutes
    return new Date(expiresAt).getTime() - refreshBuffer <= Date.now();
};

export function useAuthRefresh(tokens: TokensData | null, onAuthChange?: (tokens: TokensData | null) => void) {
    const fetcher = useApiFetcher();
    const timerRef = useRef<NodeJS.Timeout>();

    const refresh = useCallback(async () => {
        if (!tokens?.refresh || !tokens.accessExpiresAt) return;

        try {
            if (shouldRefreshToken(tokens.accessExpiresAt)) {
                const response = await fetcher('POST /v3/auth/refresh', {
                    data: { refreshToken: tokens.refresh }
                });

                if (!response.ok) {
                    throw new Error(response.data.message);
                }

                const newTokens: TokensData = {
                    access: response.data.accessToken,
                    accessExpiresAt: response.data.accessTokenExpiresAt,
                    refresh: response.data.refreshToken,
                    refreshExpiresAt: response.data.refreshTokenExpiresAt
                };

                onAuthChange?.(newTokens);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            onAuthChange?.(null);
        }
    }, [tokens, fetcher, onAuthChange]);

    useEffect(() => {
        void refresh();
        timerRef.current = setInterval(() => {
            void refresh();
        }, 60000); // Check every minute

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [refresh]);

    return { refresh };
}