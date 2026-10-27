// Clerk configuration helper
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const isClerkConfigured = () => {
  return Boolean(
    clerkPubKey &&
    typeof clerkPubKey === 'string' &&
    (clerkPubKey.startsWith('pk_test_') || clerkPubKey.startsWith('pk_live_'))
  );
};

export { clerkPubKey };
