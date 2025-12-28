// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "react-oidc-context";
import type { AuthProviderProps } from "react-oidc-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { store } from './store';
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider as CustomAuthProvider } from "@/contexts/AuthContext";
import router from "./routes";

import "./index.css"; // or your main CSS file

// ==================== CONFIG ====================

const cognitoAuthConfig: AuthProviderProps = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AdN1ymrsD",
  client_id: "1r57polokiv4t9pelkst04k131",
  redirect_uri: "http://localhost:5000/auth",
  response_type: "code",
  scope: "email openid phone",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ==================== RENDER ====================

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider {...cognitoAuthConfig}>
        <Provider store={store}>
          <CustomAuthProvider>
            <UserProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </UserProvider>
          </CustomAuthProvider>
        </Provider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);