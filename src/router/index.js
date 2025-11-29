import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DigestView from '../views/DigestView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import CalculationView from '../views/CalculationView.vue'
import WaterView from '../views/WaterView.vue'
import HabitsView from '../views/HabitsView.vue'
import HabitDetailView from '../views/HabitDetailView.vue'

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
            path: '/habits',
            name: 'habits',
            component: HabitsView
        },
        {
            path: '/habits/:id',
            name: 'habit-detail',
            component: HabitDetailView
        }
    ]
})

export default router