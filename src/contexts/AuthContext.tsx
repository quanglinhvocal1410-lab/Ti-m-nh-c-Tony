import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { gasApi } from '../utils/apiBridge';

interface AuthContextType {
  userEmail: string;
  isAdmin: boolean;
  role: string;
  isLoading: boolean;
  uid: string;
  name: string;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userEmail: '',
  isAdmin: false,
  role: 'student',
  isLoading: true,
  uid: '',
  name: '',
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('student');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Lấy thông tin user từ database để biết role
          const res = await fetch(`/api/users/${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setRole(data.role || 'student');
          } else {
            // Nếu không tìm thấy, mặc định là student
            setRole('student');
          }
        } catch (error) {
          console.error("Lỗi lấy thông tin phân quyền:", error);
        }
      } else {
        setCurrentUser(null);
        setRole('student');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = currentUser?.email === 'quanglinhvocal1410@gmail.com' || role === 'admin';

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      userEmail: currentUser?.email || '', 
      isAdmin, 
      role,
      isLoading,
      uid: currentUser?.uid || '',
      name: currentUser?.displayName || '',
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
