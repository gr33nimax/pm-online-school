import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, PieChart } from 'lucide-react';

export const AdminStatsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('http://https://pm-online-school.onrender.com/api/data')
      .then(res => {
        // Сортируем: новые сверху
        const sorted = (res.data.results || []).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setResults(sorted);
      })
      .catch(e => console.error(e));
  };

  const handleReset = async () => {
    const confirm = window.confirm(
      'ВЫ УВЕРЕНЫ?\n\nЭто действие удалит ВСЕ результаты тестирования у ВСЕХ студентов.\nСтудентам придется проходить тесты заново.'
    );
    
    if (confirm) {
      try {
        await axios.post('http://localhost:5000/api/reset-stats');
        setResults([]); // Очищаем таблицу визуально
        alert('Статистика успешно очищена');
      } catch (e) {
        alert('Ошибка при очистке');
      }
    }
  };

  const filteredResults = results.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Статистика</h1>
          <p className="text-gray-500 font-medium">Результаты тестирования студентов</p>
        </div>

        {/* КНОПКА СБРОСА */}
        {results.length > 0 && (
          <button 
            onClick={handleReset}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shadow-sm hover:shadow-red-200 hover:shadow-lg"
          >
            <Trash2 size={20} /> Сбросить всё
          </button>
        )}
      </div>

      {/* Поиск */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          placeholder="Поиск по имени студента или названию теста..."
          className="w-full bg-white p-4 pl-12 rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 font-medium transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest pl-10">Студент</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Название теста</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Балл</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right pr-10">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredResults.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-6 pl-10 font-bold text-gray-900 text-lg">{r.userName}</td>
                <td className="p-6 text-gray-500 font-medium">{r.testTitle}</td>
                <td className="p-6 text-center">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                    r.score >= 80 ? 'bg-green-100 text-green-700' :
                    r.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.score}%
                  </span>
                </td>
                <td className="p-6 pr-10 text-right text-gray-400 font-medium text-sm">
                  {new Date(r.date).toLocaleDateString()} <span className="text-gray-300">|</span> {new Date(r.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </td>
              </tr>
            ))}
            
            {filteredResults.length === 0 && (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <PieChart size={64} className="mb-4 opacity-50" />
                    <p className="font-bold text-xl">Результатов пока нет</p>
                    <p className="text-sm">Здесь появится статистика, когда студенты пройдут тесты</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
