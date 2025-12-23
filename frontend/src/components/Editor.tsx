import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Стили редактора
import { Image as ImageIcon, Trash2, Plus, GripVertical } from 'lucide-react';
import { Block } from '../types';

interface EditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export const Editor: React.FC<EditorProps> = ({ blocks, onChange }) => {
  
  const updateBlock = (id: string, content: string) => {
    onChange(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const addBlock = (type: 'text' | 'image') => {
    onChange([...blocks, { id: Date.now().toString(), type, content: '' }]);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') updateBlock(id, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Настройка панели инструментов (Toolbar)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Заголовки
      ['bold', 'italic', 'underline', 'strike'], // Жирный, Курсив...
      [{ 'color': [] }, { 'background': [] }], // Цвет текста и фона
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Списки
      ['link', 'clean'] // Ссылка и очистка форматирования
    ],
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <style>{`
        /* Кастомные стили для редактора, чтобы он выглядел чисто */
        .quill {
          background: white;
          border-radius: 0.5rem;
        }
        .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #e5e7eb !important;
          background: #f9fafb;
        }
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #e5e7eb !important;
          font-family: inherit;
          font-size: 1.125rem; /* text-lg */
        }
        .ql-editor {
          min-height: 150px;
          line-height: 1.75;
        }
        /* Чтобы списки отображались корректно */
        .ql-editor ol { list-style-type: decimal; padding-left: 1.5em; }
        .ql-editor ul { list-style-type: disc; padding-left: 1.5em; }
        .ql-editor h1 { font-size: 2em; font-weight: 800; margin-bottom: 0.5em; }
        .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; margin-top: 1em; }
        .ql-editor h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; }
      `}</style>

      <div className="space-y-8">
        {blocks.map((block) => (
          <div key={block.id} className="group relative pl-10 transition-all">
            
            {/* Управление блоком (удалить) */}
            <div className="absolute left-0 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="p-1 text-gray-300 cursor-grab"><GripVertical size={16}/></div>
               <button 
                onClick={() => removeBlock(block.id)}
                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                title="Удалить блок"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {block.type === 'text' && (
              <div className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <ReactQuill 
                  theme="snow"
                  value={block.content}
                  onChange={(content) => updateBlock(block.id, content)}
                  modules={modules}
                  placeholder="Пишите лекцию здесь или вставьте текст..."
                />
              </div>
            )}

            {block.type === 'image' && (
              <div className="relative group/img">
                {block.content ? (
                  <div className="relative">
                     <img src={block.content} className="rounded-xl shadow-md w-full border border-gray-100" alt="Uploaded" />
                     <label className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-white opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm text-gray-700">
                        Заменить
                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, block.id)} />
                     </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all">
                    <ImageIcon className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-500 font-medium">Нажмите, чтобы загрузить фото</span>
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, block.id)} />
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Панель добавления (Floating) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-100 rounded-full px-6 py-3 flex gap-4 z-20">
        <button onClick={() => addBlock('text')} className="flex items-center gap-2 font-bold text-gray-700 hover:text-indigo-600 transition-colors">
          <Plus size={18} /> Текст
        </button>
        <div className="w-px bg-gray-200"></div>
        <button onClick={() => addBlock('image')} className="flex items-center gap-2 font-bold text-gray-700 hover:text-indigo-600 transition-colors">
          <ImageIcon size={18} /> Фото
        </button>
      </div>
    </div>
  );
};