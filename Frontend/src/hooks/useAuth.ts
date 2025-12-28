import { useAuthContext } from '@/contexts/AuthContext';

// Re-export the hook that now uses Context
export const useAuth = () => {
  return useAuthContext();
};