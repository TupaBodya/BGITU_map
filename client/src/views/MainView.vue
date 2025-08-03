<template>
  <div class="main-container">
    <!-- Верхний навигационный бар -->
    <nav class="top-nav">
      <div class="logo">Карта университета</div>
      <div class="nav-buttons">
        <button @click="togglePanel('search')" :class="{ active: activePanel === 'search' }">
          <i class="fas fa-search"></i> Поиск
        </button>
        <button @click="togglePanel('history')" :class="{ active: activePanel === 'history' }">
          <i class="fas fa-history"></i> История
        </button>
        <button @click="togglePanel('filters')" :class="{ active: activePanel === 'filters' }">
          <i class="fas fa-filter"></i> Фильтры
        </button>
      </div>
      <div class="user-actions">
        <div class="user-profile" v-if="user">
          <router-link to="/profile" class="profile-link">
            <img :src="user.avatar || '/img/default-avatar.png'" class="user-avatar" alt="Аватар">
            <span>{{ user.username }}</span>
          </router-link>
          <button @click="logout"><i class="fas fa-sign-out-alt"></i> Выйти</button>
        </div>
        <div v-else class="guest-actions">
          <button @click="goToAuth" class="login-btn">
            <i class="fas fa-sign-in-alt"></i> Войти
          </button>
        </div>
      </div>
    </nav>

    <!-- Динамические панели -->
    <transition name="slide">
      <div class="side-panel" v-if="activePanel">
        <!-- Панель поиска -->
        <div v-if="activePanel === 'search'" class="search-panel">
          <div class="search-group">
            <input 
              type="text" 
              v-model="audienceSearch" 
              @input="debounceSearchAudiences" 
              placeholder="Поиск по аудиториям..."
            />
          </div>
          
          <div class="search-group">
            <input 
              type="text" 
              v-model="groupSearch" 
              @input="debounceSearchGroups" 
              placeholder="Поиск по группе..."
            />
          </div>
          
          <div class="search-group">
            <input 
              type="text" 
              v-model="teacherSearch" 
              @input="debounceSearchTeachers" 
              placeholder="Поиск по преподавателю..."
            />
          </div>
        </div>

        <!-- Панель истории -->
        <div v-if="activePanel === 'history'" class="history-panel">
          <h3>История поиска</h3>
          <ul v-if="searchHistory.length">
            <li 
              v-for="(item, index) in searchHistory" 
              :key="index"
              @click="applySearchHistory(item)"
            >
              {{ item.type }}: "{{ item.term }}" ({{ item.timestamp }})
            </li>
          </ul>
          <p v-else>История поиска пуста</p>
        </div>

        <!-- Панель фильтров -->
        <div v-if="activePanel === 'filters'" class="filters-panel">
          <div class="filter-group">
            <h3>Корпус</h3>
            <button 
              v-for="corpus in corpuses" 
              :key="corpus" 
              :class="{ 'active': selectedCorpus === corpus }"
              @click="selectCorpus(corpus)"
              class="corpus-btn"
            >
              {{ corpus }} корпус
            </button>
          </div>
          
          <div class="filter-group">
            <h3>Тип аудитории</h3>
            <label v-for="filter in filters" :key="filter.value">
              <input 
                type="checkbox" 
                v-model="selectedFilters" 
                :value="filter.value" 
              />
              {{ filter.label }}
            </label>
          </div>
        </div>
      </div>
    </transition>

    <!-- Центральная часть с картой -->
    <div class="map-container">
      <div class="map-controls">
        <button class="zoom-in" @click="zoomIn">
          <i class="fas fa-search-plus">+</i>
        </button>
        <button class="zoom-out" @click="zoomOut">
          <i class="fas fa-search-minus">-</i>
        </button>
      </div>
      
      <div class="floor-controls">
        <button 
          v-for="floor in floors" 
          :key="floor" 
          :class="{ 'active': selectedFloor === floor }"
          @click="selectFloor(floor)"
        >
          {{ floor }} этаж
        </button>
      </div>

      <div class="map-content" ref="mapContent" :style="{ backgroundImage: `url(${currentMapImage})` }">
        <svg id="audience-svg" ref="svgElement">
          <rect 
            v-for="audience in filteredAudiences" 
            :key="audience.id"
            :x="audience.x" 
            :y="audience.y" 
            :width="audience.width" 
            :height="audience.height"
            :class="['audience-rect', { 
              'highlighted': audience.highlighted, 
              'pulse': audience.highlighted,
              'lecture': audience.type === 'lecture',
              'lab': audience.type === 'lab',
              'study': audience.type === 'study'
            }]"
            @click="openModal(audience)"
          />
          <text 
            v-for="audience in filteredAudiences" 
            :key="'text-' + audience.id"
            :x="audience.x + audience.width/2" 
            :y="audience.y + audience.height/2"
            class="audience-label"
          >
            {{ audience.num_audiences }}
          </text>
        </svg>
      </div>
    </div>

    <!-- Модальное окно аудитории -->
    <div class="modal" :class="{ 'active': showModal }" @click.self="closeModal">
      <div class="close-btn" @click="closeModal">×</div>
      <div class="modal-header">
        <h2>{{ currentAudience.num_audiences }}</h2>
        <p>Корпус: {{ currentAudience.corpus }}, Этаж: {{ currentAudience.floor }}</p>
      </div>
      
      <div class="modal-content">
        <div class="swiper-container" v-if="currentImages.length">
          <div class="swiper-wrapper">
            <div 
              class="swiper-slide" 
              v-for="(image, index) in currentImages" 
              :key="index"
            >
              <img :src="image" @click="openFullscreen(image)" />
            </div>
          </div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>
        <p v-else class="no-images">Фотографии аудитории отсутствуют</p>

        <div class="schedule">
          <h3>Расписание занятий</h3>
          <div class="day-selector">
            <label>Выберите день недели:</label>
            <select v-model="selectedDay" @change="filterSchedule">
              <option v-for="day in days" :key="day" :value="day">
                {{ day }}
              </option>
            </select>
          </div>
          
          <div class="schedule-table-container">
            <table v-if="filteredSchedule.length">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Предмет</th>
                  <th>Преподаватель</th>
                  <th>Группа</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredSchedule" :key="item.id">
                  <td>{{ item.time_start }} - {{ item.time_over }}</td>
                  <td>{{ item.name_lesson }}</td>
                  <td>{{ item.surname }} {{ item.name }} {{ item.patronymic }}</td>
                  <td>{{ item.name_group }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="no-schedule">Занятий в этот день нет</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Полноэкранный просмотр изображения -->
    <div class="modal-fullscreen" :class="{ 'active': showFullscreen }" @click="closeFullscreen">
      <div class="close-btn" @click="closeFullscreen">×</div>
      <img :src="fullscreenImage" alt="Фото аудитории" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import panzoom from 'panzoom';

export default {
  name: 'MainView',
  setup() {
    const router = useRouter();
    
    // Состояние приложения
    const audiences = ref([]);
    const schedule = ref([]);
    const groups = ref([]);
    const teachers = ref([]);
    const currentAudience = ref({});
    const currentImages = ref([]);
    const fullscreenImage = ref('');
    const searchHistory = ref([]);
    const highlightedAudiences = ref(new Set());
    
    // Поиск и фильтры
    const activePanel = ref(null);
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const audienceSearch = ref('');
    const groupSearch = ref('');
    const teacherSearch = ref('');
    const selectedCorpus = ref('1');
    const selectedFloor = ref('1');
    const selectedDay = ref('Понедельник');
    const selectedFilters = ref([]);
    
    // UI состояния
    
    const showModal = ref(false);
    const showFullscreen = ref(false);
    const floorTransition = ref(false);
    const mapLoaded = ref(false);
    
    // Таймеры для debounce
    let searchAudienceTimeout = null;
    let searchGroupTimeout = null;
    let searchTeacherTimeout = null;
    
    // Константы
    const corpuses = ['1', '2'];
    const floors = ['1', '2', '3', '4'];
    const days = [
      'Понедельник', 'Вторник', 'Среда', 
      'Четверг', 'Пятница', 'Суббота', 'Воскресенье'
    ];
    const filters = [
      { value: 'lecture', label: 'Лекционный зал' },
      { value: 'lab', label: 'Лаборатория' },
      { value: 'study', label: 'Учебный кабинет' }
    ];
    
    // Refs для DOM элементов
    const mapContent = ref(null);
    const svgElement = ref(null);
    let panzoomInstance = null;
    let swiperInstance = null;
    
    const togglePanel = (panel) => {
          // Закрываем панель, если она уже открыта
          if (activePanel.value === panel) {
            activePanel.value = null;
          } else {
            activePanel.value = panel;
          }
        };

    // Вычисляемые свойства
    const currentMapImage = computed(() => {
      return `/img/maps/${selectedCorpus.value}corpus/${selectedFloor.value}floor.png`;
    });

    const filteredAudiences = computed(() => {
      return audiences.value
        .filter(audience => 
          audience.corpus === selectedCorpus.value && 
          audience.floor === selectedFloor.value
        )
        .map(audience => ({
          ...audience,
          highlighted: shouldHighlightAudience(audience)
        }));
    });
    
    const filteredSchedule = computed(() => {
      if (!currentAudience.value.id) return [];
      return schedule.value.filter(item => 
        item.day_week === selectedDay.value
      );
    });
    
    // Методы
    const fetchAudiences = async () => {
      try {
        const response = await axios.get('/api/audiences');
        audiences.value = response.data;
        console.log('Аудитории загружены:', audiences.value);
      } catch (error) {
        console.error('Ошибка загрузки аудиторий:', error);
      }
    };
    
    const fetchGroups = async () => {
      try {
        const response = await axios.get('/api/groups');
        groups.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки групп:', error);
        groups.value = [];
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get('/api/teachers');
        teachers.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        teachers.value = [];
      }
    };
    
    const fetchSchedule = async (audienceId) => {
      try {
        const response = await axios.get(`/api/schedule/${audienceId}`);
        schedule.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
      }
    };
    
    const shouldHighlightAudience = (audience) => {
      // Проверяем поиск по аудитории
      if (audienceSearch.value.length >= 3 && 
          audience.num_audiences.toLowerCase().includes(audienceSearch.value.toLowerCase())) {
        return true;
      }
      
      // Проверяем выделенные аудитории из поиска по группам/преподавателям
      return highlightedAudiences.value.has(audience.id);
    };
    
    const searchAudiences = () => {
      if (audienceSearch.value.trim().length >= 3) {
        addToSearchHistory(audienceSearch.value, 'Аудитория');
      }
    };
    
    const searchGroups = async () => {
      if (groupSearch.value.trim().length < 2) {
        highlightedAudiences.value.clear();
        return;
      }

      try {
        const response = await axios.get(`/api/schedule/group/${encodeURIComponent(groupSearch.value.trim())}`);
        const groupSchedule = response.data;
        
        // Очищаем предыдущие выделения
        highlightedAudiences.value.clear();
        
        // Добавляем ID аудиторий, где есть занятия у этой группы
        groupSchedule.forEach(item => {
          if (item.audience_id) {
            highlightedAudiences.value.add(item.audience_id);
          }
        });
        
        addToSearchHistory(groupSearch.value, 'Группа');
      } catch (error) {
        console.error('Ошибка поиска по группам:', error);
        highlightedAudiences.value.clear();
      }
    };

    const searchTeachers = async () => {
      if (teacherSearch.value.trim().length < 3) {
        highlightedAudiences.value.clear();
        return;
      }

      try {
        const response = await axios.get(`/api/schedule/teacher/${encodeURIComponent(teacherSearch.value.trim())}`);
        const teacherSchedule = response.data;
        
        // Очищаем предыдущие выделения
        highlightedAudiences.value.clear();
        
        // Добавляем ID аудиторий, где есть занятия у этого преподавателя
        teacherSchedule.forEach(item => {
          if (item.audience_id) {
            highlightedAudiences.value.add(item.audience_id);
          }
        });
        
        addToSearchHistory(teacherSearch.value, 'Преподаватель');
      } catch (error) {
        console.error('Ошибка поиска по преподавателям:', error);
        highlightedAudiences.value.clear();
      }
    };
    
    // Debounce функции для поиска
    const debounceSearchAudiences = () => {
      clearTimeout(searchAudienceTimeout);
      searchAudienceTimeout = setTimeout(searchAudiences, 500);
    };

    const debounceSearchGroups = () => {
      clearTimeout(searchGroupTimeout);
      searchGroupTimeout = setTimeout(searchGroups, 500);
    };

    const debounceSearchTeachers = () => {
      clearTimeout(searchTeacherTimeout);
      searchTeacherTimeout = setTimeout(searchTeachers, 500);
    };
    const addToSearchHistory = (term, type) => {
      // Проверяем, нет ли уже такого же поиска в истории
      const existingIndex = searchHistory.value.findIndex(
        item => item.term === term && item.type === type
      );
      
      if (existingIndex !== -1) {
        // Обновляем timestamp существующей записи
        searchHistory.value[existingIndex].timestamp = new Date().toLocaleTimeString();
      } else {
        // Добавляем новый поиск
        searchHistory.value.unshift({
          term,
          type,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      // Ограничиваем историю 10 записями
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10);
      }
    };
    
    const applySearchHistory = (item) => {
      switch (item.type) {
        case 'Аудитория':
          audienceSearch.value = item.term;
          searchAudiences();
          break;
        case 'Группа':
          groupSearch.value = item.term;
          searchGroups();
          break;
        case 'Преподаватель':
          teacherSearch.value = item.term;
          searchTeachers();
          break;
      }
    };
    
    const openModal = async (audience) => {
      currentAudience.value = audience;
      currentImages.value = [
        audience.image1,
        audience.image2,
        audience.image3
      ].filter(img => img);
      
      await fetchSchedule(audience.id);
      showModal.value = true;
      
      nextTick(() => {
        if (swiperInstance) swiperInstance.destroy();
        swiperInstance = new Swiper('.swiper-container', {
          modules: [Navigation],
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          slidesPerView: 3,
          spaceBetween: 10
        });
      });
    };
    
    const goToAuth = () => {
      router.push('/auth');
    };

    // Метод для выхода из системы
    const logout = () => {
      localStorage.removeItem('user');
      user.value = null;
      router.push('/auth');
    };

    const closeModal = () => {
      showModal.value = false;
      if (swiperInstance) {
        swiperInstance.destroy();
        swiperInstance = null;
      }
    };
    
    const openFullscreen = (image) => {
      fullscreenImage.value = image;
      showFullscreen.value = true;
    };
    
    const closeFullscreen = () => {
      showFullscreen.value = false;
    };
    
    const zoomIn = () => {
      if (panzoomInstance) {
        const transform = panzoomInstance.getTransform();
        panzoomInstance.smoothZoom(transform.x, transform.y, 1.2);
      }
    };

    const zoomOut = () => {
      if (panzoomInstance) {
        const transform = panzoomInstance.getTransform();
        panzoomInstance.smoothZoom(transform.x, transform.y, 0.8);
      }
    };
    
    const selectCorpus = (corpus) => {
      selectedCorpus.value = corpus;
      selectedFloor.value = '1';
    };
    
    const selectFloor = async (floor) => {
      floorTransition.value = true;
      await nextTick();
      selectedFloor.value = floor;
      setTimeout(() => {
        floorTransition.value = false;
      }, 300);
    };
    
    const checkImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };
    
    // Инициализация
    onMounted(async () => {
      await fetchAudiences();
      await fetchGroups();
      await fetchTeachers();
      
      if (mapContent.value) {
        panzoomInstance = panzoom(mapContent.value, {
          maxZoom: 5,
          minZoom: 0.5,
          initialZoom: 1,
          bounds: true,
          boundsPadding: 0.1
        });
      }
      
      // Проверка загрузки карты
      mapLoaded.value = await checkImage(currentMapImage.value);
      if (!mapLoaded.value) {
        console.error('Карта не загружена:', currentMapImage.value);
      }
    });
    
    // Следим за изменением этажа/корпуса
    watch([selectedCorpus, selectedFloor], async () => {
      mapLoaded.value = await checkImage(currentMapImage.value);
    });
    
    return {
      // Данные
      audiences,
      currentAudience,
      currentImages,
      fullscreenImage,
      searchHistory,
      mapLoaded,
      user,
      floorTransition,
      
      // Состояние UI
      showModal,
      showFullscreen,
      activePanel,
      
      // Поиск и фильтры
      audienceSearch,
      groupSearch,
      teacherSearch,
      selectedCorpus,
      selectedFloor,
      selectedDay,
      selectedFilters,
      
      // Константы
      corpuses,
      floors,
      days,
      filters,
      
      // Вычисляемые свойства
      currentMapImage,
      filteredAudiences,
      filteredSchedule,
      
      // Refs
      mapContent,
      svgElement,
      
      // Методы
      openModal,
      closeModal,
      openFullscreen,
      closeFullscreen,
      zoomIn,
      togglePanel,
      zoomOut,
      selectCorpus,
      goToAuth,
      logout,
      selectFloor,
      debounceSearchAudiences,
      debounceSearchGroups,
      debounceSearchTeachers,
      applySearchHistory
    };
  }
};
</script>

<style scoped>
/* Основные стили */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #325053;
}

/* Навигационная панель */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: rgba(31, 126, 241, 0.292);
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-buttons button {
  padding: 8px 15px;
  background-color: rgba(255,255,255,0.1);
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-buttons button.active {
  background-color: rgba(255,255,255,0.3);
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: white;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.login-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #369f6e;
}

/* Боковые панели */
.side-panel {
  position: fixed;
  top: 60px;
  left: 0;
  width: 300px;
  height: calc(100vh - 60px);
  background-color: white;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 100;
  overflow-y: auto;
  padding: 20px;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.search-panel,
.history-panel,
.filters-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group h3 {
  margin-top: 0;
  color: #325053;
}

.corpus-btn {
  background-color: #325053;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  margin: 5px;
  color: white;
  font-weight: 500;
}

.corpus-btn:hover {
  background-color: #1e3a3a;
  transform: translateY(-2px);
}

.corpus-btn.active {
  background-color: #1e3a3a;
}

.history-panel ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.history-panel li {
  padding: 10px;
  background-color: rgba(50, 80, 83, 0.1);
  border-radius: 8px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.history-panel li:hover {
  background-color: rgba(50, 80, 83, 0.2);
}

/* Контейнер карты */
.map-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.map-content {
  width: 2000px;
  height: 1440px;
  background-size: cover;
  position: relative;
  transition: background-image 0.5s ease-in-out;
}

#audience-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.audience-rect {
  fill: rgba(66, 185, 131, 0.3);
  stroke: #42b983;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s;
}

.audience-rect:hover {
  fill: rgba(66, 185, 131, 0.6);
}

.audience-rect.highlighted {
  fill: rgba(255, 193, 7, 0.6);
  animation: pulse 1.5s infinite;
}

.audience-rect.lecture {
  stroke: #3498db;
}

.audience-rect.lab {
  stroke: #e74c3c;
}

.audience-rect.study {
  stroke: #2ecc71;
}

.audience-label {
  font-size: 12px;
  font-weight: bold;
  text-anchor: middle;
  fill: #2c3e50;
  pointer-events: none;
}

/* Элементы управления картой */
.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zoom-in, .zoom-out {
  width: 40px;
  height: 40px;
  background-color: #325053;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.zoom-in:hover, .zoom-out:hover {
  background-color: #1e3a3a;
  transform: scale(1.1);
}

.floor-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 10px;
  background-color: rgba(255,255,255,0.8);
  padding: 10px;
  border-radius: 5px;
}

.floor-controls button {
  padding: 8px 15px;
  background-color: #325053;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.floor-controls button.active {
  background-color: #1e3a3a;
}

/* Модальные окна */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 30px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 90%;
  max-width: 1200px;
  height: auto;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 15px;
  display: none;
  animation: fadeIn 0.3s ease;
}

.modal.active {
  display: block;
  animation: fadeIn 0.3s ease;
}

.modal-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.modal-header h2 {
  margin: 0;
  color: #325053;
  font-size: 24px;
}

.modal-header p {
  margin: 5px 0 0;
  color: #666;
  font-size: 16px;
}
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  font-size: 24px;
  background: none;
  border: none;
  color: #333;
  transition: color 0.2s ease;
  padding: 5px;
}
.close-btn:hover {
  color: #000;
}

.no-images,
.no-schedule {
  text-align: center;
  color: #666;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}


.modal-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: none;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.modal-fullscreen.active {
  display: flex;
  animation: fadeIn 0.3s ease;
}

.modal-fullscreen img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  animation: zoomIn 0.3s ease;
}

.swiper-container {
  margin-top: 10px;
  width: 100%;
  height: auto;
  border-radius: 10px;
  overflow: hidden;
}
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f0f2f5;
}
.swiper-slide img {
  height: auto;
  max-height: 300px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.swiper-slide img:hover {
  transform: scale(1.03);
}
.swiper-button-next,
.swiper-button-prev {
  color: #000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.swiper-button-next:hover,
.swiper-button-prev:hover {
  background-color: rgba(255, 255, 255, 1);
}
.schedule h3 {
  margin: 0 0 15px;
  color: #325053;
  font-size: 20px;
}

.day-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

day-selector label {
  font-size: 14px;
  color: #333;
}
.day-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.day-selector select:focus {
  border-color: #325053;
  outline: none;
}

.schedule-table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f1f1f1;
  font-weight: bold;
  color: #325053;
}
tr:hover {
  background-color: #f9f9f9;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -55%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -55%);
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes zoomOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .top-nav {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .nav-buttons, .user-actions {
    width: 100%;
    margin-top: 10px;
    justify-content: center;
  }
  
  .side-panel {
    width: 100%;
    height: auto;
    max-height: 50vh;
  }
  
  .map-content {
    width: 100%;
    height: 100%;
  }
  
  .floor-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .modal {
    width: 95%;
    padding: 20px;
  }
  .swiper-slide img {
    max-height: 200px;
  }
  
  .day-selector {
    flex-direction: column;
    align-items: flex-start;
  }
  
  th, td {
    padding: 8px;
    font-size: 14px;
  }
}
</style>