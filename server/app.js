const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const hbs = require('hbs');
const cors = require('cors');
const axios = require('axios')

const app = express();
const port = 3001;

// Настройка CORS
app.use(cors({
  origin: '*'
}));

// Настройка подключения к базе данных
const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'map1',
    password: process.env.PGPASSWORD || '7632',
    port: process.env.PGPORT || 5432,
});

// Middleware для парсинга JSON
app.use(express.json());

// API маршруты
// Получение всех аудиторий
app.get('/api/audiences', async (req, res) => {
    try {
        const { rows: audiences } = await pool.query('SELECT * FROM audiences');
        res.json(audiences);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение расписания по аудитории
app.get('/api/schedule/:audienceId', async (req, res) => {
    const { audienceId } = req.params;
    try {
        const { rows: schedule } = await pool.query(`
            SELECT s.*, l.name_lesson, t.name, t.surname, t.patronymic, g.name_group 
            FROM schedule s
            JOIN lessons l ON s.lesson_id = l.id
            JOIN teachers t ON s.teacher_id = t.id
            JOIN groups g ON s.group_id = g.id
            WHERE s.audience_id = $1
        `, [audienceId]);
        res.json(schedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение расписания по группе
app.get('/api/schedule/group/:groupName', async (req, res) => {
  const { groupName } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT s.audience_id
      FROM schedule s
      JOIN groups g ON s.group_id = g.id
      WHERE g.name_group ILIKE $1
    `, [`%${groupName}%`]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/schedule/teacher/:teacherName', async (req, res) => {
  const { teacherName } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT s.audience_id
      FROM schedule s
      JOIN teachers t ON s.teacher_id = t.id
      WHERE CONCAT(t.surname, ' ', t.name, ' ', t.patronymic) ILIKE $1
    `, [`%${teacherName}%`]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение аудиторий по корпусу и этажу
app.get('/api/audiences/:corpus/:floor', async (req, res) => {
    const { corpus, floor } = req.params;
    try {
        const { rows: audiences } = await pool.query('SELECT * FROM audiences WHERE corpus = $1 AND floor = $2', [corpus, floor]);
        res.json(audiences);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
app.get('/api/groups', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM groups');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/teachers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM teachers');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// В продакшене раздаем статику Vue
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, group } = req.body;
  
  try {
    // Проверяем, существует ли пользователь
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
    }

    // Хешируем пароль (в реальном приложении используйте bcrypt)
    const passwordHash = password; // В реальном приложении: await bcrypt.hash(password, 10);
    
    // Создаем пользователя
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, passwordHash]
    );

    // Создаем профиль
    await pool.query(
      'INSERT INTO profiles (user_id, group_name) VALUES ($1, $2)',
      [user.id, group]
    );

    res.json({ 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      group
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Авторизация пользователя
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Находим пользователя
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Проверяем пароль (в реальном приложении используйте bcrypt.compare)
    const validPassword = password === user.password_hash; // В реальном приложении: await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Получаем профиль
    const { rows: [profile] } = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);

    res.json({ 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: profile.avatar_url,
      group: profile.group_name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// Получение данных пользователя
app.put('/api/auth/me', async (req, res) => {
  const { userId, username, email, group, newPassword, currentPassword } = req.body;

  try {
    // 1. Проверяем текущий пароль (если меняются важные данные или пароль)
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка текущего пароля (в реальном приложении используйте bcrypt.compare)
    if (currentPassword !== user.password_hash) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // 2. Обновляем данные пользователя
    const updateUserQuery = `
      UPDATE users 
      SET username = $1, email = $2 ${newPassword ? ', password_hash = $3' : ''}
      WHERE id = $4
      RETURNING *
    `;
    
    const updateUserParams = [
      username, 
      email,
      ...(newPassword ? [newPassword] : []),
      userId
    ];

    const { rows: [updatedUser] } = await pool.query(updateUserQuery, updateUserParams);

    // 3. Обновляем профиль
    await pool.query(
      'UPDATE profiles SET group_name = $1 WHERE user_id = $2',
      [group, userId]
    );

    // 4. Получаем обновленный профиль для ответа
    const { rows: [profile] } = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    res.json({ 
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: profile.avatar_url,
      group: profile.group_name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

// Добавьте также endpoint для обновления аватара
app.put('/api/auth/me/avatar', async (req, res) => {
  const { userId, avatarUrl } = req.body;

  try {
    await pool.query(
      'UPDATE profiles SET avatar_url = $1 WHERE user_id = $2',
      [avatarUrl, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления аватара' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BGITU Map API'
  });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});