'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { Student, Admin, AuthContextType, LoginCredentials, StudentRegistration } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Student | Admin | null>(null);
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = Cookies.get('token');
        const storedUserType = Cookies.get('userType') as 'student' | 'admin' | null;

        if (storedToken && storedUserType) {
          setToken(storedToken);
          setUserType(storedUserType);

          // Fetch user profile
          try {
            const response = storedUserType === 'student' 
              ? await authAPI.getStudentProfile()
              : await authAPI.getAdminProfile();

            if (response.data.success) {
              setUser(response.data.data[storedUserType]);
            } else {
              // Invalid token, clear auth
              clearAuth();
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setUserType(null);
    setToken(null);
    Cookies.remove('token');
    Cookies.remove('userType');
  };

  const login = async (credentials: LoginCredentials, type: 'student' | 'admin') => {
    try {
      setLoading(true);
      
      const response = type === 'student' 
        ? await authAPI.studentLogin(credentials)
        : await authAPI.adminLogin(credentials);

      if (response.data.success) {
        const { token: authToken } = response.data.data;
        const userData = response.data.data[type];

        // Store in state
        setToken(authToken);
        setUserType(type);
        setUser(userData);

        // Store in cookies
        Cookies.set('token', authToken, { expires: 30 }); // 30 days
        Cookies.set('userType', type, { expires: 30 });

        toast.success(`Welcome back, ${userData.name}!`);

        // Redirect based on user type
        if (type === 'student') {
          router.push('/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: StudentRegistration) => {
    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('rollNo', data.rollNo);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phone', data.phone);
      formData.append('idCard', data.idCard);

      const response = await authAPI.studentRegister(formData);

      if (response.data.success) {
        const { token: authToken, student } = response.data.data;

        // Store in state
        setToken(authToken);
        setUserType('student');
        setUser(student);

        // Store in cookies
        Cookies.set('token', authToken, { expires: 30 });
        Cookies.set('userType', 'student', { expires: 30 });

        toast.success('Registration successful! Welcome to Student Food App!');
        router.push('/dashboard');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    userType,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};