import { ReactNode, useCallback, useEffect, useState} from 'react'
import { Auth, AuthInitializeConfig, TokensData, UserData } from './types'
import { useApiFetcher } from "@/lib/api";
import { useFetchUserData } from "@/lib/auth/hooks/useFetchUserData.ts";
import { AuthContext } from "./AuthContext.ts";
import { convertTokenResponse } from "@/lib/auth/utils.ts";

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

/**
 * Initializes the auth state and exposes it to the component-tree below.
 *
 * This allow separate calls of `useAuth` to communicate among each-other and share
 * a single source of truth.
 */
function AuthProvider(props: AuthProviderProps): ReactNode {
  const { initialTokens, onAuthChange, children } = props

  const fetcher = useApiFetcher();
  const fetchUserData = useFetchUserData();
  const [currentUser, setCurrentUser] = useState<UserData | null | undefined>(undefined);
  const [tokens, setTokens] = useState<TokensData | null | undefined>(undefined);

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
      const userData = await fetchUserData(newTokens.access);
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

export {AuthProvider, type AuthProviderProps}
