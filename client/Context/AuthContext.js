import { createContext } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  userId: ''
});

export const AuthProvider = ({ children, value }) => {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
