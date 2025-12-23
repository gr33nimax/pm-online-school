import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, CheckCircle, PlayCircle, LogOut, FileCheck, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Lecture, Test } from '../types';

export const StudentDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'lectures' | 'tests'>('lectures');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  
  const [progress, setProgress] = useState({ viewedLectures: [] as string[], passedTests: [] as string[] });
  const [myResults, setMyResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/data');
        setLectures(res.data.lectures || []);
        setTests(res.data.tests || []);
        
        const progressMap = res.data.progressMap || {};
        setProgress(progressMap[user?.id || ''] || { viewedLectures: [], passedTests: [] });

        // Фильтруем результаты для отображения баллов на карточках
        const allResults = res.data.results || [];
        setMyResults(allResults.filter((r: any) => r.userId === user?.id));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBestScore = (testId: string) => {
    const scores = myResults.filter(r => r.testId === testId).map(r => r.score);
    return scores.length ? Math.max(...scores) : null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg"><BookOpen size={20} /></div>
            <span className="font-bold text-xl tracking-tight text-gray-900">PM-School</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-500 hidden sm:block">Студент: <span className="text-gray-900">{user?.name}</span></span>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Моё обучение</h1>
          
          {/* Табы переключения */}
          <div className="flex gap-2 p-1 bg-gray-200 rounded-2xl w-fit mt-6">
            <button 
              onClick={() => setActiveTab('lectures')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'lectures' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Лекции ({lectures.length})
            </button>
            <button 
              onClick={() => setActiveTab('tests')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'tests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Тесты ({tests.length})
            </button>
          </div>
        </div>

        {/* СЕТКА ЛЕКЦИЙ */}
        {activeTab === 'lectures' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map(lecture => {
              const isViewed = progress.viewedLectures.includes(lecture.id);
              return (
                <Link to={`/student/lecture/${lecture.id}`} key={lecture.id} className="group relative block">
                  <div className={`bg-white p-8 rounded-[2rem] border transition-all duration-300 h-full flex flex-col ${isViewed ? 'border-green-200 shadow-sm' : 'border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isViewed ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        {isViewed ? <CheckCircle size={24} /> : <BookOpen size={24} />}
                      </div>
                      {isViewed && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Изучено</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{lecture.title}</h3>
                    <p className="text-gray-400 text-sm font-medium line-clamp-3 mb-6">{lecture.description}</p>
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      Читать лекцию <PlayCircle size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
             {lectures.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">Лекций пока нет</div>}
          </div>
        )}

        {/* СЕТКА ТЕСТОВ */}
        {activeTab === 'tests' && (
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map(test => {
              const isPassed = progress.passedTests.includes(test.id);
              const score = getBestScore(test.id);
              
              return (
                <Link to={`/student/test/${test.id}`} key={test.id} className="group relative block">
                  <div className={`bg-white p-8 rounded-[2rem] border transition-all duration-300 h-full flex flex-col ${isPassed ? 'border-indigo-200 shadow-sm' : 'border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPassed ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        {isPassed ? <Award size={24} /> : <FileCheck size={24} />}
                      </div>
                      {score !== null && <span className={`text-xs font-bold px-3 py-1 rounded-full ${score >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>Лучший: {score}%</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                    <p className="text-gray-400 text-sm font-medium mb-6">{test.questions.length} вопросов</p>
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      {isPassed ? 'Пройти еще раз' : 'Начать тест'} <PlayCircle size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
            {tests.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">Тестов пока нет</div>}
          </div>
        )}

      </main>
    </div>
  );
};