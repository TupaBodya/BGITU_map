<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Мой профиль</h2>
      
      <div class="avatar-section">
        <img :src="user.avatar || '/img/default-avatar.png'" alt="Аватар" class="profile-avatar">
        <input type="file" @change="handleAvatarUpload" accept="image/*" id="avatar-upload" class="avatar-upload">
        <label for="avatar-upload" class="upload-btn">Изменить аватар</label>
      </div>
      
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label>Имя пользователя:</label>
          <input v-model="formData.username" required>
        </div>
        
        <div class="form-group">
          <label>Email:</label>
          <input v-model="formData.email" type="email" required>
        </div>
        
        <div class="form-group">
          <label>Группа:</label>
          <input v-model="formData.group" required>
        </div>
        
        <div class="form-group">
          <label>Новый пароль (оставьте пустым, если не хотите менять):</label>
          <input v-model="formData.newPassword" type="password">
        </div>
        
        <div class="form-group">
          <label>Текущий пароль (для подтверждения изменений):</label>
          <input v-model="formData.currentPassword" type="password" required>
        </div>
        
        <button type="submit" class="save-btn">Сохранить изменения</button>
        <button type="button" @click="goBack" class="back-btn">Назад</button>
      </form>
      
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter();
    const user = ref(JSON.parse(localStorage.getItem('user')));
    const formData = ref({
      username: '',
      email: '',
      group: '',
      newPassword: '',
      currentPassword: ''
    });
    const error = ref('');
    const success = ref('');
    
    onMounted(() => {
      if (!user.value) {
        router.push('/auth');
        return;
      }
      loadProfile();
    });
    
    const loadProfile = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          params: { userId: user.value.id }
        });
        
        formData.value = {
          username: response.data.username,
          email: response.data.email,
          group: response.data.group,
          newPassword: '',
          currentPassword: ''
        };
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        error.value = 'Не удалось загрузить данные профиля';
      }
    };
    
    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        // В реальном приложении нужно загрузить файл на сервер
        // Здесь просто создаем data URL для предпросмотра
        const reader = new FileReader();
        reader.onload = async (e) => {
          const avatarDataUrl = e.target.result;
          
          // Сохраняем локально для предпросмотра
          user.value.avatar = avatarDataUrl;
          
          // В реальном приложении нужно отправить на сервер:
          // await axios.put('/api/auth/me/avatar', {
          //   userId: user.value.id,
          //   avatarUrl: avatarDataUrl
          // });
          
          // Обновляем данные в localStorage
          localStorage.setItem('user', JSON.stringify(user.value));
        };
        reader.readAsDataURL(file);
      } catch (err) {
        error.value = 'Ошибка загрузки аватара';
        console.error(err);
      }
    };
    
    const updateProfile = async () => {
      try {
        const response = await axios.put('/api/auth/me', {
          userId: user.value.id,
          ...formData.value
        });
        
        // Обновляем данные пользователя
        user.value = {
          ...user.value,
          username: response.data.username,
          email: response.data.email
        };
        
        localStorage.setItem('user', JSON.stringify(user.value));
        
        success.value = 'Профиль успешно обновлен!';
        setTimeout(() => success.value = '', 3000);
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка при обновлении профиля';
        console.error(err);
      }
    };
    
    const goBack = () => {
      router.go(-1);
    };
    
    return {
      user,
      formData,
      error,
      success,
      handleAvatarUpload,
      updateProfile,
      goBack
    };
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #325053, #1e3a3a);
  padding: 20px;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 500px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #325053;
  margin-bottom: 15px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-upload {
  display: none;
}

.upload-btn {
  background-color: #42b983;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #369f6e;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #325053;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background-color: #325053;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #1e3a3a;
}

.back-btn {
  width: 100%;
  padding: 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #5a6268;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}

.success-message {
  color: #42b983;
  margin-top: 15px;
  text-align: center;
}
</style>