// import { useState } from 'react'
import './App.scss'
// import { Route, Routes } from 'react-router-dom'
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
// import Homepage from './pages/Homepage/Homepage';
import Homepage from './pages/Homepage2/Homepage';
import LoginPage from './pages/Auth/Login/LoginPage';
import RegisterPage from './pages/Auth/Register/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPassword/ResetPasswordPage';
import { useQueryClient, useMutation, useQuery, QueryClientProvider } from '@tanstack/react-query'
import { UserContext, UserProvider } from './contexts/UserContext';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function App() {

  return (
    <QueryClientProvider client={useQueryClient()}>
      <UserProvider>
        <Router>
          <Routes>
              {/* <Route path="/homepage" element={<Homepage />} /> */}
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="*" element={<div>404 Not Found</div>} />
               {/* <Toaster 
                position="top-right"
                gutter={8}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '14px',
                    maxWidth: '400px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                    style: {
                      border: '1px solid #d1fae5',
                      background: '#f0fdf4',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                    style: {
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#f97316',
                      secondary: '#fff',
                    },
                    style: {
                      border: '1px solid #fed7aa',
                      background: '#fff7ed',
                    },
                  },
                }}
              /> */}
          
          </Routes>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  )
}