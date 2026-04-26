import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextType = {
  user: any;
  loading: boolean;
  mockLogin: (email: string) => void;
  mockLogout: () => void;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  mockLogin: () => {},
  mockLogout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mockLogin = (email: string) => {
    setUser({ uid: email, email });
  };

  const mockLogout = () => {
    setUser(null);
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      if (!user) {
        setUser(u);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, mockLogin, mockLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
