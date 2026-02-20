/**
 * useAuth hook
 * Consumes AuthContext and provides auth state/methods
 */

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

/**
 * Access authentication state and methods
 * @throws Error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
