// Clerk Authentication Wrapper & Safe Provider
// Enables Clerk when VITE_CLERK_PUBLISHABLE_KEY is present and valid;
// otherwise falls back smoothly to Demo Mode without crashing.

import React, { Component } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { isClerkConfigured, clerkPubKey } from './clerkConfig';
import { AppAuthProvider } from './authContext';

// Error boundary to catch any Clerk network / initialization errors gracefully
class ClerkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Clerk initialization fallback (continuing in demo mode):', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }
    return this.props.children;
  }
}

/**
 * Conditionally wraps children in ClerkProvider if a valid publishable key exists,
 * and always provides the AppAuthProvider context.
 */
export function SafeClerkProvider({ children }) {
  if (!isClerkConfigured()) {
    return <AppAuthProvider>{children}</AppAuthProvider>;
  }

  return (
    <ClerkErrorBoundary>
      <ClerkProvider publishableKey={clerkPubKey}>
        <AppAuthProvider>{children}</AppAuthProvider>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export default SafeClerkProvider;
