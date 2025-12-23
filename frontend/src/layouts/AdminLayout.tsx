import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, PieChart, Shield, FileCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Сайдбар */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 text-indigo-700">
          <Shield size={28} />
          <span className="font-black text-xl tracking-tight">TeacherPanel</span>
        </div>
<nav className="p-4 space-y-2">
  <Link to="/admin/lectures" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium transition-colors">
    <BookOpen size={20} /> Лекции
  </Link>
  {/* НОВАЯ ССЫЛКА */}
  <Link to="/admin/tests" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium transition-colors">
    <FileCheck size={20} /> Тесты
  </Link>
  <Link to="/admin/stats" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium transition-colors">
    <PieChart size={20} /> Статистика
  </Link>
</nav>
        <div className="absolute bottom-6 left-0 w-full px-4">
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg w-full font-medium transition-colors">
            <LogOut size={20} /> Выйти
          </button>
        </div>
      </aside>

      {/* Контент */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};