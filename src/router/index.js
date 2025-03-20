import { createRouter, createWebHistory } from 'vue-router'
import MoldListView from '../views/MoldListView.vue'

const routes = [
    {
        path: '/',
        name: 'MoldList',
        component: MoldListView
    },
    {
        path: '/mold/:id',
        name: 'MoldDetail',
        component: () => import('../views/MoldDetailView.vue')
    },
    {
        path: '/mold/:moldId/process/:processId',
        name: 'ProcessDetail',
        component: () => import('../views/ProcessDetailView.vue')
    },
    {
        path: '/materials',
        name: 'MaterialStock',
        component: () => import('../views/MaterialStockView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
