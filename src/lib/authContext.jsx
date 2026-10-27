import React from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { isClerkConfigured } from './clerkConfig';
import { DEMO_USER } from '../data/mockData';
import { AuthContext } from './useAppAuth';

function ClerkInnerAuthProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();

  const value = {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    user: user || null,
    displayName:
      isSignedIn && user
        ? user.fullName || user.firstName || 'Resident Contributor'
        : DEMO_USER.name,
    displayEmail:
      isSignedIn && user
        ? user.primaryEmailAddress?.emailAddress || ''
        : DEMO_USER.email,
    displayAvatar:
      isSignedIn && user
        ? user.imageUrl || DEMO_USER.avatar
        : DEMO_USER.avatar,
    isDemo: !isSignedIn,
    signOut: () => clerk.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }) {
  if (isClerkConfigured()) {
    return <ClerkInnerAuthProvider>{children}</ClerkInnerAuthProvider>;
  }

  const defaultDemoValue = {
    isLoaded: true,
    isSignedIn: false,
    user: null,
    displayName: DEMO_USER.name,
    displayEmail: DEMO_USER.email,
    displayAvatar: DEMO_USER.avatar,
    isDemo: true,
    signOut: () => {},
  };

  return <AuthContext.Provider value={defaultDemoValue}>{children}</AuthContext.Provider>;
}

export default AppAuthProvider;
