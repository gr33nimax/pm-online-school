import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, BookOpen, Edit } from 'lucide-react';
import { Lecture } from '../types';

export const AdminLecturesPage = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);

  // Загружаем данные при открытии страницы
  useEffect(() => {
    axios.get('https://pm-online-school.onrender.com/api/data')
      .then(res => setLectures(res.data.lectures || []))
      .catch(err => console.error(err));
  }, []);

  const deleteLecture = async (id: string) => {
    if (!window.confirm('Удалить эту лекцию?')) return;
    
    try {
      // 1. Получаем полные данные
      const res = await axios.get('http://localhost:5000/api/data');
      // 2. Фильтруем
      const updatedLectures = res.data.lectures.filter((l: Lecture) => l.id !== id);
      // 3. Отправляем обратно
      await axios.post('http://localhost:5000/api/save', { ...res.data, lectures: updatedLectures });
      // 4. Обновляем UI
      setLectures(updatedLectures);
    } catch (e) {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Лекции</h1>
          <p className="text-gray-500 font-medium">Управляйте учебным материалом</p>
        </div>
        <Link 
          to="/admin/lectures/new" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Создать лекцию
        </Link>
      </div>

      <div className="grid gap-4">
        {lectures.map(lecture => (
          <div key={lecture.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{lecture.title}</h3>
                <p className="text-gray-400 text-sm font-medium line-clamp-1">{lecture.description || 'Нет описания'}</p>
              </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Кнопка Редактировать */}
              <Link 
              to={`/admin/lectures/edit/${lecture.id}`}
              className="p-3 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
  >
              <Edit size={20} />
            </Link>
  
            <button onClick={() => deleteLecture(lecture.id)} /* ... */ >
            <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {lectures.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">Лекций пока нет</p>
            <p className="text-gray-300">Нажмите кнопку создать, чтобы добавить первую</p>
          </div>
        )}
      </div>
    </div>
  );
};
