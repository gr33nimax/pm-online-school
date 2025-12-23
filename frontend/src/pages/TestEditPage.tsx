import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, PlusCircle, CheckCircle2, Image as ImageIcon, X, Plus, ListPlus, KeyRound, Sparkles } from 'lucide-react';
import { Test, Question } from '../types';

export const TestEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [test, setTest] = useState<Test>({
    id: Date.now().toString(),
    title: '',
    questions: []
  });

  const [keysInput, setKeysInput] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    if (id) {
      axios.get('http://localhost:5000/api/data')
        .then(res => {
          const found = res.data.tests.find((t: Test) => t.id === id);
          if (found) setTest(found);
        });
    }
  }, [id]);

  // --- CRUD ФУНКЦИИ ---
  const addQuestion = () => {
    setTest({ ...test, questions: [...test.questions, { id: Date.now().toString(), text: '', options: ['', ''], correctIndex: 0 }] });
  };

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    const updated = [...test.questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setTest({ ...test, questions: updated });
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...test.questions];
    updated[qIdx].options[oIdx] = val;
    setTest({ ...test, questions: updated });
  };

  const addOption = (qIdx: number) => {
    const updated = [...test.questions];
    updated[qIdx].options.push('');
    setTest({ ...test, questions: updated });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const updated = [...test.questions];
    if (updated[qIdx].options.length <= 2) return alert('Минимум 2 варианта');
    updated[qIdx].options.splice(oIdx, 1);
    if (updated[qIdx].correctIndex === oIdx) updated[qIdx].correctIndex = 0;
    else if (updated[qIdx].correctIndex > oIdx) updated[qIdx].correctIndex -= 1;
    setTest({ ...test, questions: updated });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, qIdx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') updateQuestion(qIdx, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ВСТАВКА ВАРИАНТОВ ОТВЕТА (ДЛЯ ОДНОГО ВОПРОСА) ---
  const handleOptionPaste = async (qIdx: number) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      // Очистка от нумерации (а), 1., -)
      const cleanOptions = lines.map(line => line.replace(/^([a-zA-Zа-яА-Я0-9]+\s*[).]\s*)|(^-\s*)/, '').trim());
      
      const updated = [...test.questions];
      updated[qIdx].options = cleanOptions;
      updated[qIdx].correctIndex = 0;
      setTest({ ...test, questions: updated });
    } catch (e) { alert('Ошибка вставки'); }
  };

  // --- ЛОГИКА ПОЛНОГО ИМПОРТА (ИСПРАВЛЕННАЯ) ---
  const processFullImport = () => {
    if (!importText.trim()) return;

    // 1. Разбиваем на блоки по пустой строке
    const blocks = importText.split(/\n\s*\n/);
    
    const newQuestions: Question[] = [];

    blocks.forEach(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return; // Пропускаем мусор

      // Первая строка - вопрос (убираем "1. " или "Вопрос 1.")
      const questionText = lines[0].replace(/^(\d+[\.\)]\s*)|(Вопрос \d+:?\s*)/i, '').trim();
      
      // Остальные строки - ответы
      const rawOptions = lines.slice(1);
      const options: string[] = [];
      let correctIndex = 0;

      rawOptions.forEach((opt, idx) => {
        // 1. Проверяем, есть ли метка правильного ответа (+ или *)
        const isMarkedCorrect = /^[\+\*]/.test(opt);
        
        // 2. Сначала жестко удаляем маркер правильного ответа (+ или *) в начале
        let cleanOpt = opt.replace(/^[\+\*]\s*/, '');

        // 3. Теперь удаляем нумерацию (a), 1., -), если она есть
        cleanOpt = cleanOpt.replace(/^([a-zA-Zа-яА-Я0-9]+\s*[).]\s*)|(^-\s*)/, '').trim();
        
        options.push(cleanOpt);
        if (isMarkedCorrect) correctIndex = idx;
      });

      newQuestions.push({
        id: Date.now().toString() + Math.random(),
        text: questionText,
        options: options,
        correctIndex: correctIndex
      });
    });

    setTest({ ...test, questions: [...test.questions, ...newQuestions] });
    setShowImport(false);
    setImportText('');
    alert(`Импортировано вопросов: ${newQuestions.length}`);
  };

  // --- КЛЮЧИ ---
  const applyKeys = () => {
    if (!keysInput.trim()) return;
    const charMap: Record<string, number> = { 'а': 0, 'a': 0, 'б': 1, 'b': 1, 'в': 2, 'c': 2, 'v': 2, 'г': 3, 'd': 3, 'g': 3, 'д': 4, 'e': 4 };
    const updatedQuestions = [...test.questions];
    let appliedCount = 0;
    const parts = keysInput.split(/[,;\n]+/).map(s => s.trim()).filter(s => s);

    parts.forEach(part => {
      const match = part.match(/^(\d+)[\s-.:]+([а-яa-z])/i);
      if (match) {
        const qIdx = parseInt(match[1]) - 1;
        const correctIdx = charMap[match[2].toLowerCase()];
        if (updatedQuestions[qIdx] && correctIdx !== undefined && correctIdx < updatedQuestions[qIdx].options.length) {
          updatedQuestions[qIdx].correctIndex = correctIdx;
          appliedCount++;
        }
      }
    });
    setTest({ ...test, questions: updatedQuestions });
    alert(`Обновлено ответов: ${appliedCount}`);
    setKeysInput('');
  };

  const save = async () => {
    if (!test.title) return alert('Название обязательно');
    try {
      const res = await axios.get('http://localhost:5000/api/data');
      let newTests = res.data.tests || [];
      if (id) newTests = newTests.map((t: Test) => t.id === id ? test : t);
      else newTests.push(test);
      await axios.post('http://localhost:5000/api/save', { ...res.data, tests: newTests });
      navigate('/admin/tests');
    } catch (e) { alert('Ошибка'); }
  };

  return (
    <div className="max-w-4xl mx-auto pb-40">
      <header className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50/80 backdrop-blur z-10 py-4">
        <button onClick={() => navigate('/admin/tests')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold">
          <ArrowLeft size={20} /> Назад
        </button>
        <button onClick={save} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
          {id ? 'Сохранить изменения' : 'Создать тест'}
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100 mb-10">
        <input 
          placeholder="Название теста" 
          className="text-4xl font-black w-full mb-10 outline-none placeholder:text-gray-200"
          value={test.title}
          onChange={e => setTest({ ...test, title: e.target.value })}
        />

        {/* --- КНОПКА ГЛОБАЛЬНОГО ИМПОРТА --- */}
        {!showImport && (
          <div className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">У вас есть готовый тест в Word?</h3>
            <p className="text-indigo-600/70 mb-6 max-w-lg">Просто скопируйте текст с вопросами и ответами, вставьте его сюда, и мы автоматически создадим карточки.</p>
            <button 
              onClick={() => setShowImport(true)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Sparkles size={20} /> Импортировать весь тест
            </button>
          </div>
        )}

        {/* --- ОКНО ИМПОРТА --- */}
        {showImport && (
          <div className="mb-10 bg-white border-2 border-indigo-500 rounded-[2rem] p-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">Вставьте текст теста</h3>
              <button onClick={() => setShowImport(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl">
              Формат:<br/>
              1. Текст вопроса<br/>
              Вариант 1<br/>
              +Правильный вариант (начните с + или *)<br/>
              Вариант 3<br/>
              <br/>
              (Обязательно оставляйте пустую строку между вопросами!)
            </p>
            <textarea 
              className="w-full h-64 p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 font-mono text-sm"
              placeholder={`1. Сколько будет 2+2?\nТри\n+Четыре\nПять\n\n2. Следующий вопрос...`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <button 
              onClick={processFullImport}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700"
            >
              Распознать и добавить
            </button>
          </div>
        )}

        <div className="space-y-12">
          {test.questions.map((q, qIdx) => (
            <div key={q.id} className="relative group">
              <div className="absolute left-[-20px] top-0 bottom-0 w-1 bg-gray-100 rounded-full group-hover:bg-indigo-200 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-indigo-500 font-bold uppercase text-xs tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Вопрос {qIdx + 1}</h3>
                <button onClick={() => {
                   const updated = test.questions.filter((_, i) => i !== qIdx);
                   setTest({ ...test, questions: updated });
                }} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>

              {q.image && (
                <div className="relative mb-6 w-fit">
                  <img src={q.image} className="max-h-64 rounded-xl object-cover shadow-sm border border-gray-100" />
                  <button onClick={() => updateQuestion(qIdx, 'image', undefined)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110"><X size={14} /></button>
                </div>
              )}

              <div className="flex gap-4 items-start mb-6">
                 <label className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors flex-shrink-0">
                    <ImageIcon size={20} />
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, qIdx)} />
                 </label>
                 <textarea 
                  rows={1}
                  className="w-full bg-transparent text-xl font-bold mt-2 outline-none placeholder:text-gray-300 border-b border-transparent focus:border-gray-200 transition-colors resize-none overflow-hidden"
                  value={q.text}
                  onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                  onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between mb-3 pl-4 pr-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Варианты ответа</span>
                <button onClick={() => handleOptionPaste(qIdx)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
                  <ListPlus size={14} /> Вставить списком
                </button>
              </div>

              <div className="grid gap-3 pl-4">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <button onClick={() => updateQuestion(qIdx, 'correctIndex', oIdx)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${q.correctIndex === oIdx ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}>
                      {q.correctIndex === oIdx && <CheckCircle2 size={14} />}
                    </button>
                    <input className={`flex-1 p-3 rounded-xl border outline-none font-medium transition-all ${q.correctIndex === oIdx ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 focus:border-indigo-400'}`} value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}/>
                    <button onClick={() => removeOption(qIdx, oIdx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                  </div>
                ))}
                <button onClick={() => addOption(qIdx)} className="flex items-center gap-2 text-sm font-bold text-indigo-500 hover:text-indigo-700 mt-2 px-3 py-1 w-fit rounded-lg hover:bg-indigo-50 transition-colors">
                  <Plus size={16} /> Добавить вариант
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* КНОПКИ ВНИЗУ */}
        <div className="mt-12 flex gap-4">
          <button onClick={addQuestion} className="flex-1 py-6 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-lg">
            <PlusCircle size={24} /> Добавить вопрос
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-8 rounded-[2.5rem] border border-gray-200">
        <div className="flex items-center gap-3 mb-4 text-gray-600">
          <KeyRound size={24} />
          <h3 className="font-bold text-lg">Быстрая простановка ключей (если не указали + в импорте)</h3>
        </div>
        <div className="flex gap-4">
          <input value={keysInput} onChange={(e) => setKeysInput(e.target.value)} placeholder="1-А, 2-Б, 3-В..." className="flex-1 p-4 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 font-medium"/>
          <button onClick={applyKeys} className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-black transition-colors">Применить</button>
        </div>
      </div>
    </div>
  );
};