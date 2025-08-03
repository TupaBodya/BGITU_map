<template>
  <div class="admin-container">
    <header>
      <div class="logo">Панель администрирования</div>
      <nav>
        <ul>
          <li><router-link to="/">Главная</router-link></li>
          <li><router-link to="/admin">Админ</router-link></li>
        </ul>
      </nav>
    </header>

    <main>
      <!-- Преподаватели -->
      <section>
        <h1>Преподаватели</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Отчество</th>
              <th>Должность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teachers" :key="teacher.id">
              <td>{{ teacher.id }}</td>
              <td>{{ teacher.surname }}</td>
              <td>{{ teacher.name }}</td>
              <td>{{ teacher.patronymic }}</td>
              <td>{{ teacher.post }}</td>
              <td>
                <router-link :to="`/admin/edit/teachers/${teacher.id}`">Изменить</router-link>
                <form @submit.prevent="deleteItem('teachers', teacher.id)" style="display:inline;">
                  <button type="submit">Удалить</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Добавить преподавателя</h2>
        <form @submit.prevent="addTeacher">
          <input type="text" v-model="newTeacher.surname" placeholder="Фамилия" required>
          <input type="text" v-model="newTeacher.name" placeholder="Имя" required>
          <input type="text" v-model="newTeacher.patronymic" placeholder="Отчество">
          <input type="text" v-model="newTeacher.post" placeholder="Должность" required>
          <button type="submit">Добавить</button>
        </form>
      </section>

      <!-- Расписание -->
      <section>
        <h1>Расписание</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Предмет</th>
              <th>Преподаватель</th>
              <th>Группа</th>
              <th>Аудитория</th>
              <th>Время начала</th>
              <th>Время окончания</th>
              <th>День недели</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in schedule" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name_lesson }}</td>
              <td>{{ item.teacher_surname }} {{ item.teacher_name }} {{ item.teacher_patronymic }}</td>
              <td>{{ item.name_group }}</td>
              <td>{{ item.num_audiences }}</td>
              <td>{{ item.time_start }}</td>
              <td>{{ item.time_over }}</td>
              <td>{{ item.day_week }}</td>
              <td>
                <router-link :to="`/admin/edit/schedule/${item.id}`">Изменить</router-link>
                <form @submit.prevent="deleteItem('schedule', item.id)" style="display:inline;">
                  <button type="submit">Удалить</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Добавить расписание</h2>
        <form @submit.prevent="addSchedule">
          <select v-model="newSchedule.lesson_id" required>
            <option value="">Выбрать предмет</option>
            <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
              {{ lesson.name_lesson }}
            </option>
          </select>
          
          <select v-model="newSchedule.teacher_id">
            <option value="">Выбрать преподавателя</option>
            <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
              {{ teacher.surname }} {{ teacher.name }}
            </option>
          </select>
          
          <select v-model="newSchedule.group_id" required>
            <option value="">Выбрать группу</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name_group }}
            </option>
          </select>
          
          <select v-model="newSchedule.audience_id">
            <option value="">Выбрать аудиторию</option>
            <option v-for="audience in audiences" :key="audience.id" :value="audience.id">
              {{ audience.num_audiences }} (Корпус {{ audience.corpus }})
            </option>
          </select>
          
          <input type="time" v-model="newSchedule.time_start" required>
          <input type="time" v-model="newSchedule.time_over" required>
          
          <select v-model="newSchedule.day_week" required>
            <option value="Понедельник">Понедельник</option>
            <option value="Вторник">Вторник</option>
            <option value="Среда">Среда</option>
            <option value="Четверг">Четверг</option>
            <option value="Пятница">Пятница</option>
            <option value="Суббота">Суббота</option>
            <option value="Воскресенье">Воскресенье</option>
          </select>
          
          <button type="submit">Добавить</button>
        </form>
      </section>

      <!-- Группы -->
      <section>
        <h1>Группы</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название группы</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in groups" :key="group.id">
              <td>{{ group.id }}</td>
              <td>{{ group.name_group }}</td>
              <td>
                <router-link :to="`/admin/edit/groups/${group.id}`">Изменить</router-link>
                <form @submit.prevent="deleteItem('groups', group.id)" style="display:inline;">
                  <button type="submit">Удалить</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Добавить группу</h2>
        <form @submit.prevent="addGroup">
          <input type="text" v-model="newGroup.name_group" placeholder="Название группы" required>
          <button type="submit">Добавить</button>
        </form>
      </section>

      <!-- Аудитории -->
      <section>
        <h1>Аудитории</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Номер аудитории</th>
              <th>Корпус</th>
              <th>Фото 1</th>
              <th>Фото 2</th>
              <th>Фото 3</th>
              <th>Этаж</th>
              <th>X</th>
              <th>Y</th>
              <th>Длина</th>
              <th>Высота</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="audience in audiences" :key="audience.id">
              <td>{{ audience.id }}</td>
              <td>{{ audience.num_audiences }}</td>
              <td>{{ audience.corpus }}</td>
              <td>{{ audience.image1 }}</td>
              <td>{{ audience.image2 }}</td>
              <td>{{ audience.image3 }}</td>
              <td>{{ audience.floor }}</td>
              <td>{{ audience.x }}</td>
              <td>{{ audience.y }}</td>
              <td>{{ audience.width }}</td>
              <td>{{ audience.height }}</td>
              <td>
                <router-link :to="`/admin/edit/audiences/${audience.id}`">Изменить</router-link>
                <form @submit.prevent="deleteItem('audiences', audience.id)" style="display:inline;">
                  <button type="submit">Удалить</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Добавить аудиторию</h2>
        <form @submit.prevent="addAudience">
          <input type="text" v-model="newAudience.num_audiences" placeholder="Номер аудитории" required>
          <input type="text" v-model="newAudience.corpus" placeholder="Корпус" required>
          <input type="text" v-model="newAudience.image1" placeholder="Ссылка на фото 1">
          <input type="text" v-model="newAudience.image2" placeholder="Ссылка на фото 2">
          <input type="text" v-model="newAudience.image3" placeholder="Ссылка на фото 3">
          <input type="text" v-model="newAudience.floor" placeholder="Этаж" required>
          <input type="text" v-model="newAudience.x" placeholder="Координата X" required>
          <input type="text" v-model="newAudience.y" placeholder="Координата Y" required>
          <input type="text" v-model="newAudience.width" placeholder="Длина" required>
          <input type="text" v-model="newAudience.height" placeholder="Высота" required>
          <button type="submit">Добавить</button>
        </form>
      </section>

      <!-- Предметы -->
      <section>
        <h1>Предметы</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название предмета</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lesson in lessons" :key="lesson.id">
              <td>{{ lesson.id }}</td>
              <td>{{ lesson.name_lesson }}</td>
              <td>
                <router-link :to="`/admin/edit/lessons/${lesson.id}`">Изменить</router-link>
                <form @submit.prevent="deleteItem('lessons', lesson.id)" style="display:inline;">
                  <button type="submit">Удалить</button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Добавить предмет</h2>
        <form @submit.prevent="addLesson">
          <input type="text" v-model="newLesson.name_lesson" placeholder="Название предмета" required>
          <button type="submit">Добавить</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'AdminView',
  setup() {
    // Данные
    const teachers = ref([]);
    const groups = ref([]);
    const audiences = ref([]);
    const lessons = ref([]);
    const schedule = ref([]);

    // Новые записи
    const newTeacher = ref({
      name: '',
      surname: '',
      patronymic: '',
      post: ''
    });

    const newGroup = ref({
      name_group: ''
    });

    const newAudience = ref({
      num_audiences: '',
      corpus: '',
      image1: '',
      image2: '',
      image3: '',
      floor: '',
      x: '',
      y: '',
      width: '',
      height: ''
    });

    const newLesson = ref({
      name_lesson: ''
    });

    const newSchedule = ref({
      lesson_id: '',
      teacher_id: '',
      group_id: '',
      audience_id: '',
      time_start: '',
      time_over: '',
      day_week: 'Понедельник'
    });

    // Методы
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          axios.get('/api/teachers'),
          axios.get('/api/groups'),
          axios.get('/api/audiences'),
          axios.get('/api/lessons'),
          axios.get('/api/schedule')
        ]);

        teachers.value = responses[0].data;
        groups.value = responses[1].data;
        audiences.value = responses[2].data;
        lessons.value = responses[3].data;
        schedule.value = responses[4].data;
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    const addTeacher = async () => {
      try {
        await axios.post('/api/teachers', newTeacher.value);
        newTeacher.value = { name: '', surname: '', patronymic: '', post: '' };
        await fetchData();
      } catch (error) {
        console.error('Ошибка при добавлении преподавателя:', error);
      }
    };

    const addGroup = async () => {
      try {
        await axios.post('/api/groups', newGroup.value);
        newGroup.value = { name_group: '' };
        await fetchData();
      } catch (error) {
        console.error('Ошибка при добавлении группы:', error);
      }
    };

    const addAudience = async () => {
      try {
        await axios.post('/api/audiences', newAudience.value);
        newAudience.value = {
          num_audiences: '',
          corpus: '',
          image1: '',
          image2: '',
          image3: '',
          floor: '',
          x: '',
          y: '',
          width: '',
          height: ''
        };
        await fetchData();
      } catch (error) {
        console.error('Ошибка при добавлении аудитории:', error);
      }
    };

    const addLesson = async () => {
      try {
        await axios.post('/api/lessons', newLesson.value);
        newLesson.value = { name_lesson: '' };
        await fetchData();
      } catch (error) {
        console.error('Ошибка при добавлении предмета:', error);
      }
    };

    const addSchedule = async () => {
      try {
        await axios.post('/api/schedule', newSchedule.value);
        newSchedule.value = {
          lesson_id: '',
          teacher_id: '',
          group_id: '',
          audience_id: '',
          time_start: '',
          time_over: '',
          day_week: 'Понедельник'
        };
        await fetchData();
      } catch (error) {
        console.error('Ошибка при добавлении расписания:', error);
      }
    };

    const deleteItem = async (table, id) => {
      if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        try {
          await axios.delete(`/api/${table}/${id}`);
          await fetchData();
        } catch (error) {
          console.error('Ошибка при удалении:', error);
        }
      }
    };

    // Загрузка данных при монтировании
    onMounted(fetchData);

    return {
      // Данные
      teachers,
      groups,
      audiences,
      lessons,
      schedule,
      
      // Новые записи
      newTeacher,
      newGroup,
      newAudience,
      newLesson,
      newSchedule,
      
      // Методы
      addTeacher,
      addGroup,
      addAudience,
      addLesson,
      addSchedule,
      deleteItem
    };
  }
};
</script>

<style scoped>
/* Основные стили админ-панели */
.admin-container {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
}

header {
  background-color: #35424a;
  color: #ffffff;
  padding: 10px 0;
  text-align: center;
  transition: background-color 0.5s;
}

header:hover {
  background-color: #2c3e50;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav ul li {
  display: inline;
  margin: 0 15px;
}

nav a {
  color: #ffffff;
  text-decoration: none;
}

main {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

section {
  margin-bottom: 40px;
}

h1, h2 {
  color: #35424a;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

table th, table td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
  transition: background-color 0.3s;
}

table th {
  background-color: #35424a;
  color: #ffffff;
}

table tbody tr:hover {
  background-color: #f1f1f1;
}

button {
  background-color: #5cb85c;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

button:hover {
  background-color: #4cae4c;
  transform: translateY(-2px);
}

/* Стили для кнопки Delete */
form button[type="submit"] {
  background-color: #d9534f;
}

form button[type="submit"]:hover {
  background-color: #c9302c;
}

form {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

input, select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

a {
  color: #337ab7;
  text-decoration: none;
  margin-right: 5px;
}

a:hover {
  text-decoration: underline;
}
</style>