import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/components/Layout/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/index.vue'),
    },
    {
      path: '/',
      component: Layout,
      redirect: { name: 'ProjectTypes' },
      meta: { requiresAuth: true },
      children: [
        {
          path: 'project-types',
          name: 'ProjectTypes',
          component: () => import('@/views/ProjectTypes/index.vue'),
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('@/views/Projects/index.vue'),
        },
        {
          path: 'experts',
          name: 'Experts',
          component: () => import('@/views/Experts/index.vue'),
        },
        {
          path: 'login-logs',
          name: 'LoginLogs',
          component: () => import('@/views/LoginLogs/index.vue'),
        },
        {
          path: 'votes',
          name: 'Votes',
          component: () => import('@/views/Votes/index.vue'),
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/Statistics/index.vue'),
        },
        {
          path: 'vote-statistics/:sessionGuid',
          name: 'VoteStatistics',
          component: () => import('@/views/VoteStatistics/index.vue'),
        },
      ],
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  console.log('Router guard:', { 
    toName: to.name, 
    toPath: to.path, 
    toFullPath: to.fullPath,
    fromName: from.name, 
    fromPath: from.path,
    hasToken: !!token,
    requiresAuth: to.meta.requiresAuth,
    matched: to.matched.map(m => m.path)
  });
  
  if (to.name === 'Login') {
    if (token) {
      console.log('Redirecting to ProjectTypes (has token)');
      next({ name: 'ProjectTypes' });
    } else {
      console.log('Allowing access to Login');
      next();
    }
  } else {
    if (to.meta.requiresAuth && !token) {
      console.log('Redirecting to Login (no token)');
      next({ name: 'Login' });
    } else {
      console.log('Allowing access to', to.name || to.path);
      next();
    }
  }
});

export default router;
