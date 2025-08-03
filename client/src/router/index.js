import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';
import AdminView from '../views/AdminView.vue';
import AuthView from '../views/AuthView.vue';
import ProfileView from '../views/ProfileView.vue';

const routes = [
  {
    path: '/',
    name: 'main',
    component: MainView,
    meta: { requiresAuth: false}
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Навигационный guard для проверки аутентификации
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (to.meta.requiresAuth && !user) {
    next('/auth');
  } else if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    next('/');
  } else if (to.meta.requiresGuest && user) {
    next('/');
  } else {
    next();
  }
});

export default router;