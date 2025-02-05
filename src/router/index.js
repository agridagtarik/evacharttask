import { createRouter, createWebHistory } from 'vue-router'
import DashBoardView from '@/views/DashBoardView.vue'
import LoginView from '@/views/LoginView.vue'
import store from '@/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LoginPage',
      component: LoginView,
    },
    { path: '/dashboard', component: DashBoardView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.token) {
    next('/')
  } else {
    next()
    if (from.path === '/dashboard') {
      store.commit('logout')
    }
  }
})

export default router
