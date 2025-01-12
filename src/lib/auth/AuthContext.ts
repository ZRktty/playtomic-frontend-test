import { createContext } from 'react';
import { Auth } from './types';

const AuthContext = createContext<Auth | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

export { AuthContext };