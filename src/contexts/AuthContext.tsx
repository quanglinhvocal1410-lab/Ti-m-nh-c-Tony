import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gasApi } from '../utils/apiBridge';

interface AuthContextType {
  userEmail: string;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userEmail: '',
  isAdmin: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = await gasApi.call('getActiveUserEmail');
        setUserEmail(email || 'guest@tiemdaynhac.com');
      } catch (error) {
        console.error('Failed to fetch user email:', error);
        setUserEmail('guest@tiemdaynhac.com'); // Fallback for local dev
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isAdmin = userEmail === 'quanglinhvocal1410@gmail.com';

  return (
    <AuthContext.Provider value={{ userEmail, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
