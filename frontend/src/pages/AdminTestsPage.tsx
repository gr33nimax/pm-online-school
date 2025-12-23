import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, FileCheck, Edit } from 'lucide-react';
import { Test } from '../types';

export const AdminTestsPage = () => {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    axios.get('http://https://pm-online-school.onrender.com/api/data')
      .then(res => setTests(res.data.tests || []));
  }, []);

  const deleteTest = async (id: string) => {
    if (!window.confirm('Удалить тест?')) return;
    try {
      const res = await axios.get('http://localhost:5000/api/data');
      const updated = res.data.tests.filter((t: Test) => t.id !== id);
      await axios.post('http://localhost:5000/api/save', { ...res.data, tests: updated });
      setTests(updated);
    } catch (e) {
      alert('Ошибка');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Тесты</h1>
          <p className="text-gray-500 font-medium">Проверка знаний</p>
        </div>
        <Link to="/admin/tests/new" className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2">
          <Plus size={20} /> Создать тест
        </Link>
      </div>

      <div className="grid gap-4">
        {tests.map(test => (
          // ВОТ ЗДЕСЬ БЫЛА ОШИБКА. Мы вернули контейнер карточки "group"
          <div key={test.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
            
            {/* Левая часть: Иконка и Название */}
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <FileCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{test.title}</h3>
                <p className="text-gray-400 text-sm font-medium">{test.questions.length} вопросов</p>
              </div>
            </div>

            {/* Правая часть: Кнопки (появляются при наведении) */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link 
                to={`/admin/tests/edit/${test.id}`}
                className="p-3 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Edit size={20} />
              </Link>
              <button 
                onClick={() => deleteTest(test.id)} 
                className="p-3 bg-gray-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
          </div>
        ))}

        {tests.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">Тестов пока нет</p>
            <p className="text-gray-300">Нажмите кнопку создать, чтобы добавить первый</p>
          </div>
        )}
      </div>
    </div>
  );
};
