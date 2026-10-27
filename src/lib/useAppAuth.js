import { createContext, useContext } from 'react';
import { DEMO_USER } from '../data/mockData';

export const AuthContext = createContext({
  isLoaded: true,
  isSignedIn: false,
  user: null,
  displayName: DEMO_USER.name,
  displayEmail: DEMO_USER.email,
  displayAvatar: DEMO_USER.avatar,
  isDemo: true,
  signOut: () => {},
});

export function useAppAuth() {
  return useContext(AuthContext);
}
