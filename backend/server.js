const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

// ВАЖНО: Разрешаем большие запросы (до 50мб) для загрузки картинок
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Инициализация базы данных, если файла нет
const initDB = async () => {
    if (!fs.existsSync(DB_FILE)) {
        await fs.writeJson(DB_FILE, { 
            lectures: [], 
            tests: [], 
            users: [], // Можно хранить юзеров тут, если захочешь усложнить
            results: [] // Результаты тестов
        });
    }
};
initDB();

// 1. Получить все данные
app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readJson(DB_FILE);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка чтения базы' });
    }
});
app.post('/api/reset-stats', async (req, res) => {
    try {
        const data = await fs.readJson(DB_FILE);
        
        // 1. Очищаем массив результатов
        data.results = [];
        
        // 2. Убираем галочки "Тест сдан" у всех студентов
        // Проходимся по всем ключам (id студентов) в progressMap
        if (data.progressMap) {
            for (const userId in data.progressMap) {
                data.progressMap[userId].passedTests = [];
            }
        }

        await fs.writeJson(DB_FILE, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сброса' });
    }
    });

// 2. Сохранить все данные (перезапись)
app.post('/api/save', async (req, res) => {
    try {
        // Мы ожидаем, что фронтенд пришлет полный обновленный объект (например, список лекций)
        // Но чтобы не потерять другие данные, лучше читать и мержить, 
        // или фронт должен присылать структуру целиком.
        // Для простоты в твоем текущем коде фронт шлёт обновленную структуру.
        
        // Перезаписываем файл тем, что прислал фронт
        await fs.writeJson(DB_FILE, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сохранения' });
    }
});

app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON http://localhost:${PORT}`);
});