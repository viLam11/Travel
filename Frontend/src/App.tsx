// // import { useState } from 'react'
// import './App.scss'
// // import { Route, Routes } from 'react-router-dom'
// import { Routes, Route, BrowserRouter as Router, useNavigate } from "react-router-dom";
// // import Homepage from './pages/Homepage/Homepage';
// import Homepage from './pages/Homepage/Homepage';
// import LoginPage from './pages/Auth/Login/LoginPage';
// import RegisterPage from './pages/Auth/Register/RegisterPage';
// import ForgotPasswordPage from './pages/Auth/ForgotPassword/ForgotPasswordPage';
// import ResetPasswordPage from './pages/Auth/ResetPassword/ResetPasswordPage';
// import VerifyEmailPage from './pages/Auth/VerifyEmail/VerifyEmailPage';
// import DestinationDetailPage from './pages/DestinationDetail/DestinationDetailPage';
// import DestinationFilterPage from './pages/DestinationFilter/DestinationFilterPage';
// import ServiceDetailPage from './pages/ServiceDetail/ServiceDetailPage';
// import HotelDashboard from './pages/ServiceProvider/Dashboard/DashBoardPage';
// import { useQueryClient, useMutation, useQuery, QueryClientProvider } from '@tanstack/react-query'
// import { UserContext, UserProvider } from './contexts/UserContext';
// import { Toaster } from 'react-hot-toast';
// import { useState } from 'react';

// export default function App() {
//   const navigate = useNavigate();
//   return (
//     <QueryClientProvider client={useQueryClient()}>
//       <UserProvider>
//         {/* <Router> */}
//           <Routes>
//               {/* <Route path="/homepage" element={<Homepage />} /> */}
//               <Route path="/homepage" element={<Homepage  onNavigateToDestinations={() => navigate('/destinations')} />} />
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/register" element={<RegisterPage />} />
//               <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//               <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
//               <Route path="/verify-email" element={<VerifyEmailPage />} />
//               <Route path="/destinations/:destination" element={<DestinationDetailPage />} />
//               <Route path="/destinations" element={<DestinationFilterPage />} />
//               <Route path="/destinations/:destination/:serviceType/:idSlug" element={<ServiceDetailPage />} />
//               <Route path="/admin/dashboard" element={<HotelDashboard />} />
//               {/* <Route path="/services" element={<ServiceDetailPage />} />
//                */}
              
//               {/* <Route 
//                 path="/destination/:destination/:serviceType/:idSlug" 
//                 element={<ServiceDetailPage />} 
//               /> */}
//               <Route path="*" element={<div>404 Not Found</div>} />
          
//           </Routes>
//         {/* </Router> */}
//       </UserProvider>
//     </QueryClientProvider>
//   )
// }

// src/App.tsx
import './App.scss';
import { Outlet } from 'react-router-dom';

/**
 * App component - giờ chỉ là wrapper đơn giản
 * Routing logic đã được chuyển sang routes/routes.tsx
 * và được sử dụng qua RouterProvider trong main.tsx
 */
export default function App() {
  return <Outlet />;
}