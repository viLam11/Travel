import { useState } from 'react'
import './App.scss'
// import { Route, Routes } from 'react-router-dom'
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Homepage from './pages/Homepage/Homepage';
import { useQueryClient, useMutation, useQuery, QueryClientProvider } from '@tanstack/react-query'
import { UserContext, UserProvider } from './context/UserContext';

export default function App() {
  return (
    <QueryClientProvider client={useQueryClient()}>
      <UserProvider>
        <Router>
          <Routes>
              <Route path="/homepage" element={<Homepage />} />
              <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  )
}

