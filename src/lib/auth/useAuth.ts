import { Auth } from './types'
import { useContext } from "react";
import { AuthContext } from "@/lib/auth/AuthContext.ts";

/**
 * Returns the current auth state. See {@link Auth} for more information on
 * what is included there.
 *
 * @throws {TypeError} if called from a component not descendant of AuthProvider
 */
function useAuth(): Auth {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new TypeError(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap a parent component in <AuthProvider> to fix this error.'
    )
  }

  return context
}

export { useAuth }
