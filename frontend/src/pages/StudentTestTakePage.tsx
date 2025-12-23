import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Test } from '../types';

export const StudentTestTakePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  
  // Храним ответы: индекс вопроса -> индекс выбранного варианта
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/data')
      .then(res => {
        const found = res.data.tests.find((t: Test) => t.id === id);
        if (found) {
          setTest(found);
          setAnswers(new Array(found.questions.length).fill(-1));
        }
      });
  }, [id]);

  const handleSelect = (qIdx: number, oIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  const submitTest = async () => {
    if (answers.includes(-1)) {
      alert('Пожалуйста, ответьте на все вопросы!');
      return;
    }

    if (!test || !user) return;

    // Считаем баллы
    let correctCount = 0;
    test.questions.forEach((q, i) => {
      if (q.correctIndex === answers[i]) correctCount++;
    });

    const scorePercent = Math.round((correctCount / test.questions.length) * 100);

    // Сохраняем результат
    try {
      const res = await axios.get('http://localhost:5000/api/data');
      const data = res.data;
      
      // 1. Добавляем в массив результатов
      const newResult = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        testId: test.id,
        testTitle: test.title,
        score: scorePercent,
        date: new Date().toISOString()
      };
      
      const newResults = [...(data.results || []), newResult];

      // 2. Обновляем прогресс юзера (чтобы поставить галочку)
      const progressMap = data.progressMap || {};
      const myProgress = progressMap[user.id] || { viewedLectures: [], passedTests: [] };
      
      if (!myProgress.passedTests.includes(test.id)) {
        myProgress.passedTests.push(test.id);
      }

      await axios.post('http://localhost:5000/api/save', {
        ...data,
        results: newResults,
        progressMap: { ...progressMap, [user.id]: myProgress }
      });

      setShowResult(scorePercent);

    } catch (e) {
      alert('Ошибка отправки');
    }
  };

  if (!test) return <div className="p-10 text-center">Загрузка теста...</div>;

  if (showResult !== null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${showResult >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <span className="text-3xl font-black">{showResult}%</span>
          </div>
          <h2 className="text-2xl font-black mb-2 text-gray-900">
            {showResult >= 70 ? 'Отличный результат!' : 'Стоит повторить материал'}
          </h2>
          <p className="text-gray-500 mb-8">Тест завершен</p>
          <button onClick={() => navigate('/student')} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all w-full">
            Вернуться в меню
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-32">
      <button onClick={() => navigate('/student')} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-8">
        <ArrowLeft size={20} /> Выйти из теста
      </button>

      <h1 className="text-4xl font-black text-gray-900 mb-2">{test.title}</h1>
      <p className="text-gray-400 font-medium mb-10">Всего вопросов: {test.questions.length}</p>

      <div className="space-y-12">
        {test.questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex gap-4">
              <span className="text-indigo-500">#{qIdx + 1}</span> 
              {q.text}
            </h3>

            {q.image && (
              <img src={q.image} className="w-full rounded-2xl mb-6 shadow-sm border border-gray-50 max-h-80 object-cover" />
            )}

            <div className="grid gap-3">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelect(qIdx, oIdx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 font-medium ${
                    answers[qIdx] === oIdx 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[qIdx] === oIdx ? 'border-indigo-600' : 'border-gray-400'
                  }`}>
                    {answers[qIdx] === oIdx && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-gray-100 p-6 flex justify-center z-20">
        <button 
          onClick={submitTest}
          className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          Завершить тестирование <CheckCircle2 />
        </button>
      </div>
    </div>
  );
};