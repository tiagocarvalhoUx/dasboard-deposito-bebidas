import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import type { Usuario } from '@/types';

interface AuthContextData {
  user: Usuario | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, perfil: 'admin' | 'vendedor') => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as Usuario);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'usuarios', result.user.uid));
    if (userDoc.exists()) {
      setUser({ id: userDoc.id, ...userDoc.data() } as Usuario);
    }
  };

  const register = async (email: string, password: string, nome: string, perfil: 'admin' | 'vendedor') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    const newUser: Omit<Usuario, 'id'> = {
      email,
      nome,
      perfil,
      ativo: true,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'usuarios', result.user.uid), newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.perfil === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
