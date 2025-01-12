import { createContext, ReactNode, useCallback, useEffect, useState} from 'react'
import { Auth, AuthInitializeConfig, TokensData, UserData } from './types'
import { useApiFetcher } from "@/lib/api";
import { User } from "@/lib/api-types";

interface AuthProviderProps extends AuthInitializeConfig {
  children?: ReactNode

  /**
   * @see {@link AuthInitializeConfig.initialTokens}
   */
  initialTokens?: AuthInitializeConfig['initialTokens']

  /**
   * @see {@link AuthInitializeConfig.onAuthChange}
   */
  onAuthChange?: AuthInitializeConfig['onAuthChange']
}


const AuthContext = createContext<Auth | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

/**
 * Initializes the auth state and exposes it to the component-tree below.
 *
 * This allow separate calls of `useAuth` to communicate among each-other and share
 * a single source of truth.
 */
function AuthProvider(props: AuthProviderProps): ReactNode {
  const { initialTokens, onAuthChange, children } = props

  const [currentUser, setCurrentUser] = useState<UserData | null | undefined>(undefined);
  const [tokens, setTokens] = useState<TokensData | null | undefined>(undefined);
  const fetcher = useApiFetcher();

  // Fetch user data using the access token
  const fetchUserData = useCallback(async (accessToken?: string): Promise<UserData> => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      headers['authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetcher('GET /v1/users/me', {}, { headers });

    if (!response.ok) {
      throw new Error(response.data.message);
    }

    const user: User = response.data
    return {
      userId: user.userId,
      name: user.displayName,
      email: user.email ?? '', // user might not have an email , so default to empty string
    };
  }, [fetcher]);

  // Convert API response to TokensData format
  const convertTokenResponse = (response: {
    accessToken: string
    accessTokenExpiresAt: string
    refreshToken: string
    refreshTokenExpiresAt: string
  }): TokensData => ({
    access: response.accessToken,
    accessExpiresAt: response.accessTokenExpiresAt,
    refresh: response.refreshToken,
    refreshExpiresAt: response.refreshTokenExpiresAt
  });

  // Handle initial tokens loading
  useEffect(() => {
    const loadInitialTokens = async () => {
      try {
        const initialTokensValue = await initialTokens
        setTokens(initialTokensValue ?? null)

        // If we have tokens, fetch the user data
        if (initialTokensValue) {
          const userData = await fetchUserData(initialTokensValue.access)
          setCurrentUser(userData)
        } else {
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Failed to load initial tokens:', error)
        setTokens(null)
        setCurrentUser(null)
      }
    }

    loadInitialTokens().catch(error => {
      console.error('Failed to load initial auth state:', error)
      setTokens(null)
      setCurrentUser(null)
    })
  }, [initialTokens, fetchUserData])

  // Handle auth changes
  useEffect(() => {
    if (tokens !== undefined && onAuthChange) {
      onAuthChange(tokens)
    }
  }, [tokens, onAuthChange])

  const logout = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Clear authentication tokens
        setTokens(null);
        setCurrentUser(null);

        // Notify any listeners about the auth state change
        if (onAuthChange) {
          onAuthChange(null);
        }

        resolve();
      } catch (error) {
        console.error('Failed to logout:', error);
        reject(new Error('Failed to logout'));
      }
    });
  }, [onAuthChange]);

  const contextValue: Auth = {
    currentUser,
    tokens,
    async login(credentials) {
      if (currentUser) {
        throw new Error('User is already logged in')
      }

      const loginResponse = await fetcher('POST /v3/auth/login', {
        data: credentials
      })

      if (!loginResponse.ok) {
        throw new Error(loginResponse.data.message)
      }

      // Convert and store tokens
      const newTokens = convertTokenResponse(loginResponse.data)
      setTokens(newTokens)

      // Fetch and store user data
      const userData = await fetchUserData();
      setCurrentUser(userData);
    },
    logout
  }
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthProvider, AuthContext, type AuthProviderProps}
