import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Lecture } from '../types';

export const StudentLectureView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lecture, setLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/data')
      .then(res => {
        const found = res.data.lectures.find((l: Lecture) => l.id === id);
        setLecture(found || null);
      });
  }, [id]);

  const markAsCompleted = async () => {
    if (!user) return;
    try {
      const res = await axios.get('http://localhost:5000/api/data');
      const data = res.data;
      const progressMap = data.progressMap || {};
      const myProgress = progressMap[user.id] || { viewedLectures: [], passedTests: [] };
      
      if (!myProgress.viewedLectures.includes(id)) {
        myProgress.viewedLectures.push(id);
        await axios.post('http://localhost:5000/api/save', {
          ...data,
          progressMap: { ...progressMap, [user.id]: myProgress }
        });
      }
      navigate('/student');
    } catch (e) {
      alert('Ошибка сохранения');
    }
  };

  if (!lecture) return <div className="text-center p-10">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Стили для списков (обязательно!) */}
      <style>{`
        .ql-editor ol { list-style-type: decimal; padding-left: 1.5em; }
        .ql-editor ul { list-style-type: disc; padding-left: 1.5em; }
        .ql-editor h1 { font-size: 2em; font-weight: 800; margin-bottom: 0.5em; }
        .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; margin-top: 1em; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-20">
        <button 
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-colors mb-8"
        >
          <ArrowLeft size={20} /> К списку лекций
        </button>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
          {lecture.title}
        </h1>
        <p className="text-xl text-gray-500 font-medium leading-relaxed border-l-4 border-indigo-500 pl-6 mb-12">
          {lecture.description}
        </p>

        {/* Контент */}
        <div className="space-y-8">
          {lecture.blocks.map(block => (
            <div key={block.id}>
              {block.type === 'text' && (
                <div 
                  className="prose prose-lg max-w-none text-gray-800 leading-loose ql-editor"
                  style={{ padding: 0 }}
                  dangerouslySetInnerHTML={{ __html: block.content }} 
                />
              )}
              {block.type === 'image' && (
                <img 
                  src={block.content} 
                  className="w-full rounded-2xl shadow-lg my-8" 
                  alt="Content" 
                />
              )}
            </div>
          ))}
        </div>

        {/* Кнопка теперь НЕ fixed, а просто внизу с отступом */}
        <div className="mt-24 border-t border-gray-100 pt-10 flex justify-center">
          <button 
            onClick={markAsCompleted}
            className="bg-green-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-green-200 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <CheckCircle size={24} /> Я изучил материал
          </button>
        </div>
      </div>
    </div>
  );
};