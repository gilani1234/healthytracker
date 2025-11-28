import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DigestView from '../views/DigestView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import CalculationView from '../views/CalculationView.vue'
import WaterView from '../views/WaterView.vue'
import BadHabitsView from '../views/BadHabitsView.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/digest',
            name: 'digest',
            component: DigestView
        },
        {
            path: '/statistics',
            name: 'statistics',
            component: StatisticsView 
        },
        {
            path: '/calculation',
            name: 'calculation',
            component: CalculationView
        },
        {
            path: '/water',
            name: 'water',
            component: WaterView
        },
        {
            path: '/bad-habits',
            name: 'bad-habits',
            component: BadHabitsView
        }
    ]
})

export default router