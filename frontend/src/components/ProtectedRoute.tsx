import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRole: 'admin' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { user } = useAuth();

  // 1. Если пользователь не вошел вообще -> на выход
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Если пользователь вошел, но его роль не совпадает -> на выход
  if (user.role !== allowedRole) {
    // Если студент пытается зайти в админку - кидаем к студентам
    // Если админ к студентам - кидаем в админку
    const redirectPath = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Если всё ок -> показываем контент
  return <Outlet />;
};