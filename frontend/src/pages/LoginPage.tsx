import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    if (isAdmin) {
      const pass = (form.elements.namedItem('pass') as HTMLInputElement).value;
      if (pass === 'admin123') {
        login({ id: 'admin', name: 'Преподаватель', role: 'admin' });
        navigate('/admin/lectures');
      } else {
        alert('Неверный пароль');
      }
    } else {
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const surname = (form.elements.namedItem('surname') as HTMLInputElement).value;
      login({ id: Date.now().toString(), name: `${name} ${surname}`, role: 'student' });
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl max-w-md w-full border border-white transition-all duration-300">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 mx-auto shadow-lg transition-colors ${isAdmin ? 'bg-gray-900 shadow-gray-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
          {isAdmin ? <ShieldCheck size={40} /> : <GraduationCap size={40} />}
        </div>

        <h1 className="text-3xl font-black text-center mb-2 text-gray-900">
          {isAdmin ? 'Преподаватель' : 'Студент'}
        </h1>
        <p className="text-center text-gray-400 font-medium mb-8">
          {isAdmin ? 'Вход в панель управления' : 'Добро пожаловать в школу'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isAdmin ? (
            <input 
              name="pass" 
              type="password" 
              placeholder="Пароль администратора" 
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
          ) : (
            <>
              <input name="name" required placeholder="Имя" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              <input name="surname" required placeholder="Фамилия" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
            </>
          )}

          <button className={`w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${isAdmin ? 'bg-gray-900 shadow-gray-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
            Войти <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isAdmin ? '← Вернуться ко входу для студентов' : 'Вход для преподавателей →'}
          </button>
        </div>
      </div>
    </div>
  );
};