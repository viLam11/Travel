
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { UserProvider } from "./context/UserContext";
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AdN1ymrsD",
  client_id: "1r57polokiv4t9pelkst04k131",
  redirect_uri: "http://localhost:5000/auth",
  response_type: "code",
  scope: "email openid phone",
};
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"

const queryClient = new QueryClient({
  defaultOptions: {
    staleTime: 1000 * 60 * 5, // 5 minutes, dv: ms
  }
});
const root = ReactDOM.createRoot(document.getElementById("root"));

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