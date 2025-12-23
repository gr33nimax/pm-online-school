import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Editor } from '../components/Editor';
import { Lecture } from '../types';

export const LectureEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Получаем ID из URL
  const [lecture, setLecture] = useState<Lecture>({
    id: Date.now().toString(),
    title: '',
    description: '',
    blocks: []
  });

  // Если мы в режиме редактирования - загружаем данные
  useEffect(() => {
    if (id) {
      axios.get('http://https://pm-online-school.onrender.com/api/data')
        .then(res => {
          const found = res.data.lectures.find((l: Lecture) => l.id === id);
          if (found) setLecture(found);
        });
    }
  }, [id]);

  const save = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/data');
      let newLectures = res.data.lectures || [];
      
      if (id) {
        // Режим обновления
        newLectures = newLectures.map((l: Lecture) => l.id === id ? lecture : l);
      } else {
        // Режим создания
        newLectures.push(lecture);
      }
      
      await axios.post('http://localhost:5000/api/save', { ...res.data, lectures: newLectures });
      navigate('/admin/lectures');
    } catch (e) {
      alert('Ошибка сохранения');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50/80 backdrop-blur z-10 py-4">
        <button onClick={() => navigate('/admin/lectures')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold">
          <ArrowLeft size={20} /> Назад
        </button>
        <button onClick={save} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
          {id ? 'Обновить лекцию' : 'Опубликовать'}
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm p-12 min-h-[80vh]">
        <input 
          placeholder="Заголовок лекции" 
          className="text-5xl font-black w-full mb-6 outline-none placeholder:text-gray-200"
          value={lecture.title}
          onChange={e => setLecture({ ...lecture, title: e.target.value })}
        />
        <input 
          placeholder="Краткое описание..." 
          className="text-xl font-medium text-gray-500 w-full mb-12 outline-none placeholder:text-gray-200"
          value={lecture.description}
          onChange={e => setLecture({ ...lecture, description: e.target.value })}
        />
        
        <Editor blocks={lecture.blocks} onChange={blocks => setLecture({ ...lecture, blocks })} />
      </div>
    </div>
  );
};
