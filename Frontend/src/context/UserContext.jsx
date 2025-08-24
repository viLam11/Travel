import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const fetchUserData  = async () => {
    try {
      const accessToken = sessionStorage.getItem("access_token");
      const profile = sessionStorage.getItem("profile");

      setUser(JSON.parse(profile));
      setAccessToken(accessToken);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);
  
  
  
  return (
    <UserContext.Provider value={{
      user, setUser, accessToken, setAccessToken
    }}>
      {children}
    </UserContext.Provider>
  )
}