import { createRouter, createWebHashHistory } from 'vue-router';
import MoldListView from '../views/MoldListView.vue';
import LoginView from '../views/LoginView.vue';
import storage from '../utils/storage';

const routes = [
    {
        path: '/',
        name: 'MoldList',
        component: MoldListView,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { guest: true }
    },
    {
        path: '/mold/:id',
        name: 'MoldDetail',
        component: () => import('../views/MoldDetailView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/mold/:moldId/process/:processId',
        name: 'ProcessDetail',
        component: () => import('../views/ProcessDetailView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/materials',
        name: 'MaterialStock',
        component: () => import('../views/MaterialStockView.vue'),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!storage.getData('auth_token');

    // 需要认证的路由
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            // 没有登录，重定向到登录页
            next({ name: 'Login' });
        } else {
            // 已登录，允许访问
            next();
        }
    }
    // 只有游客可以访问的路由
    else if (to.matched.some(record => record.meta.guest)) {
        if (isAuthenticated) {
            // 已登录，重定向到首页
            next({ name: 'MoldList' });
        } else {
            // 未登录，允许访问
            next();
        }
    }
    // 其他路由
    else {
        next();
    }
});

export default router;
