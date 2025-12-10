import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChange, getCurrentUser, checkUserProfile } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Check user profile
        const profileStatus = await checkUserProfile(firebaseUser.uid);
        setUserProfile(profileStatus);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    isAuthenticated,
    loading,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;