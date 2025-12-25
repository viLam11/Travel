import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface User {
    // Define user properties based on your application needs
    // You should replace this with actual user interface from your app
    id?: string;
    name?: string;
    email?: string;
    [key: string]: any; // Allow additional properties
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
}

interface UserProviderProps {
    children: ReactNode;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const fetchUserData = async (): Promise<void> => {
        try {
            const accessToken = sessionStorage.getItem("access_token");
            const profile = sessionStorage.getItem("profile");

            if (profile) {
                setUser(JSON.parse(profile) as User);
            }
            setAccessToken(accessToken);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    const contextValue: UserContextType = {
        user,
        setUser,
        accessToken,
        setAccessToken
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}