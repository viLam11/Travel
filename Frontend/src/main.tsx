import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import type { AuthProviderProps } from "react-oidc-context";
import { UserProvider } from "./contexts/UserContext";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

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
            // retry: 1,
            // refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
        <UserProvider>
          <App />
          <ReactQueryDevtools />
        </UserProvider>
      </AuthProvider>
    </React.StrictMode>
  </QueryClientProvider>
);