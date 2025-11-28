import { defineStore } from 'pinia'

export const useHabitsStore = defineStore('habits', {
    state: () => ({
        habits: [
            {
                id: 1,
                title: 'Алкоголь',
                description: 'Пиво, вино, крепкие напитки',
                icon: '🍷',
                color: '#4ecdc4'
            },
            {
                id: 2,
                title: 'Курение',
                description: 'Сигареты, вейп, кальян',
                icon: '🚬',
                color: '#ff6b6b'
            },
            {
                id: 3,
                title: 'Фастфуд',
                description: 'Гамбургеры, картошка фри, пицца',
                icon: '🍔',
                color: '#ffa726'
            }
        ],
        // Активные привычки, которые отслеживаются
        activeHabits: [],
        // Текущая выбранная привычка для отображения
        selectedHabitId: null,
        // История дней без привычек: { habitId: { '2024-01-15': true, '2024-01-16': true, ... } }
        trackedDays: {}
    }),
    getters: {
        getHabitById: (state) => (id) => {
            return state.habits.find(h => h.id === id)
        },
        getActiveHabit: (state) => {
            return state.activeHabits.length > 0 ? state.activeHabits[0] : null
        },
        getTrackedDaysForHabit: (state) => (habitId) => {
            return state.trackedDays[habitId] || {}
        },
        isDayTracked: (state) => (habitId, dateString) => {
            const habitDays = state.trackedDays[habitId] || {}
            return habitDays[dateString] === true
        },
        isDayRelapse: (state) => (habitId, dateString) => {
            const habitDays = state.trackedDays[habitId] || {}
            return habitDays[dateString] === 'relapse'
        },
        getStreakDays: (state) => (habitId) => {
            const habitDays = state.trackedDays[habitId] || {}
            const dates = Object.keys(habitDays).filter(date => habitDays[date] === true)
            if (dates.length === 0) return 0
            
            // Сортируем даты
            dates.sort((a, b) => new Date(a) - new Date(b))
            
            // Проверяем последовательность с сегодняшнего дня назад
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            let streak = 0
            let checkDate = new Date(today)
            
            while (true) {
                const dateString = formatDateStringHelper(checkDate)
                if (habitDays[dateString] === true) {
                    streak++
                    checkDate.setDate(checkDate.getDate() - 1)
                } else {
                    break
                }
            }
            
            return streak
        },
        getTotalDays: (state) => (habitId) => {
            const habitDays = state.trackedDays[habitId] || {}
            return Object.keys(habitDays).filter(date => habitDays[date] === true).length
        }
    },
    actions: {
        addActiveHabit(habitId) {
            if (!this.activeHabits.includes(habitId)) {
                this.activeHabits.push(habitId)
                // Инициализируем отслеживание для этой привычки
                if (!this.trackedDays[habitId]) {
                    this.trackedDays[habitId] = {}
                }
            }
        },
        removeActiveHabit(habitId) {
            const index = this.activeHabits.indexOf(habitId)
            if (index > -1) {
                this.activeHabits.splice(index, 1)
            }
        },
        toggleDay(habitId, dateString) {
            if (!this.trackedDays[habitId]) {
                this.trackedDays[habitId] = {}
            }
            
            // Переключаем состояние дня
            const currentValue = this.trackedDays[habitId][dateString]
            if (currentValue === true) {
                delete this.trackedDays[habitId][dateString]
            } else if (currentValue === 'relapse') {
                delete this.trackedDays[habitId][dateString]
            } else {
                this.trackedDays[habitId][dateString] = true
            }
        },
        markDay(habitId, dateString, value = true) {
            if (!this.trackedDays[habitId]) {
                this.trackedDays[habitId] = {}
            }
            this.trackedDays[habitId][dateString] = value
        },
        markRelapse(habitId, dateString) {
            if (!this.trackedDays[habitId]) {
                this.trackedDays[habitId] = {}
            }
            this.trackedDays[habitId][dateString] = 'relapse'
        },
        addCustomHabit(title, description, icon = '🎯', color = '#667eea') {
            // Генерируем новый ID (максимальный существующий + 1)
            const maxId = Math.max(...this.habits.map(h => h.id), 0)
            const newHabit = {
                id: maxId + 1,
                title: title,
                description: description || '',
                icon: icon,
                color: color
            }
            this.habits.push(newHabit)
            return newHabit.id
        },
        setSelectedHabit(habitId) {
            this.selectedHabitId = habitId
        },
        deleteHabit(habitId) {
            // Удаляем из списка привычек
            const index = this.habits.findIndex(h => h.id === habitId)
            if (index > -1) {
                this.habits.splice(index, 1)
            }
            // Удаляем из активных
            this.removeActiveHabit(habitId)
            // Удаляем данные отслеживания
            if (this.trackedDays[habitId]) {
                delete this.trackedDays[habitId]
            }
            // Удаляем дату начала из localStorage
            localStorage.removeItem(`habit_start_${habitId}`)
            // Если это была выбранная привычка, выбираем другую
            if (this.selectedHabitId === habitId) {
                this.selectedHabitId = this.activeHabits.length > 0 ? this.activeHabits[0] : null
            }
        }
    }
})

// Вспомогательная функция для форматирования даты в строку
function formatDateStringHelper(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

