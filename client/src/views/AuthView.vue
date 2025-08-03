<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Имя пользователя</label>
          <input v-model="formData.username" required>
        </div>
        
        <div v-if="!isLoginMode" class="form-group">
          <label>Email</label>
          <input v-model="formData.email" type="email" required>
        </div>
        
        <div class="form-group">
          <label>Пароль</label>
          <input v-model="formData.password" type="password" required>
        </div>
        
        <div v-if="!isLoginMode" class="form-group">
          <label>Группа</label>
          <input v-model="formData.group" required>
        </div>
        
        <button type="submit" class="auth-btn">
          {{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}
        </button>
        
        <button type="button" @click="toggleMode" class="toggle-btn">
          {{ isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </button>
      </form>
      
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'AuthView',
  setup() {
    const router = useRouter();
    const isLoginMode = ref(true);
    const error = ref('');
    
    const formData = ref({
      username: '',
      email: '',
      password: '',
      group: ''
    });
    
    const toggleMode = () => {
      isLoginMode.value = !isLoginMode.value;
      error.value = '';
    };
    
    const handleSubmit = async () => {
      try {
        const endpoint = isLoginMode.value ? '/api/auth/login' : '/api/auth/register';
        const response = await axios.post(endpoint, formData.value);
        
        // Сохраняем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Перенаправляем на главную страницу
        router.push('/');
      } catch (err) {
        error.value = err.response?.data?.error || 'Произошла ошибка';
        console.error(err);
      }
    };
    
    return {
      isLoginMode,
      formData,
      error,
      toggleMode,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #325053, #1e3a3a);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
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

.auth-btn {
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

.auth-btn:hover {
  background-color: #1e3a3a;
}

.toggle-btn {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  color: #325053;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}
</style>