import { defineStore } from 'pinia'

export const useHabitsStore = defineStore('habits', {
    state: () => {
        // Загружаем данные из localStorage при инициализации
        const savedHabits = localStorage.getItem('habits_data')
        const savedCalendar = localStorage.getItem('habits_calendar')
        const savedCurrentDay = localStorage.getItem('habits_currentDay')
        
        let habits = savedHabits ? JSON.parse(savedHabits) : []
        let needsMigration = false
        
        // Миграция: добавляем emoji для существующих привычек, если его нет
        habits = habits.map(habit => {
            // Проверяем, что emoji отсутствует или пустое
            if (!habit.emoji || (typeof habit.emoji === 'string' && habit.emoji.trim() === '')) {
                habit.emoji = '🚫'
                needsMigration = true
            }
            return habit
        })
        
        // Сохраняем обновленные привычки обратно, если была миграция
        if (needsMigration) {
            localStorage.setItem('habits_data', JSON.stringify(habits))
        }
        
        return {
            habits: habits, // Список вредных привычек
            calendar: savedCalendar ? JSON.parse(savedCalendar) : [], // Календарь с отметками
            currentDay: savedCurrentDay ? JSON.parse(savedCurrentDay) : {} // Текущий выбранный день
        }
    },
    actions: {
        // Добавление новой привычки
        addHabit(name, description = '', emoji = '🚫') {
            // Убеждаемся, что emoji - это строка
            const habitEmoji = emoji && typeof emoji === 'string' ? emoji : '🚫'
            const newHabit = {
                id: Date.now(),
                name: name,
                description: description,
                emoji: habitEmoji,
                createdAt: new Date().toISOString(),
                lastRelapse: null, // Дата последнего срыва (null если не было срывов)
                relapses: [] // Массив дат срывов
            }
            this.habits.push(newHabit)
            this.saveToLocalStorage()
            return newHabit
        },
        // Удаление привычки
        removeHabit(habitId) {
            this.habits = this.habits.filter(h => h.id !== habitId)
            // Удаляем все отметки этой привычки из календаря
            this.calendar = this.calendar.map(day => {
                if (day.habits) {
                    day.habits = day.habits.filter(h => h.habitId !== habitId)
                }
                return day
            })
            this.saveToLocalStorage()
        },
        // Установка текущего дня
        setCurrentDay(day, month, year) {
            const selectedDay = this.calendar.find((element) => 
                element.date.day === day && 
                element.date.month === month && 
                element.date.year === year
            )

            if (selectedDay) {
                this.currentDay = selectedDay
            } else {
                const newCalendarDay = {
                    date: {
                        day: day,
                        month: month,
                        year: year
                    },
                    habits: [] // Массив отметок о том, что в этот день не поддались привычкам
                }
                
                this.calendar.push(newCalendarDay)
                this.currentDay = newCalendarDay
            }
            
            this.saveToLocalStorage()
        },
        // Отметить, что в этот день не поддались привычке
        markHabitSuccess(habitId) {
            if (!this.currentDay || !this.currentDay.date) {
                return
            }
            
            // Проверяем, не отмечена ли уже эта привычка на этот день
            if (!this.currentDay.habits) {
                this.currentDay.habits = []
            }
            
            const existingMark = this.currentDay.habits.find(h => h.habitId === habitId)
            if (existingMark) {
                return // Уже отмечено
            }
            
            this.currentDay.habits.push({
                habitId: habitId,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toISOString()
            })
            
            this.saveToLocalStorage()
        },
        // Убрать отметку (если ошибочно отметили)
        unmarkHabitSuccess(habitId) {
            if (!this.currentDay || !this.currentDay.habits) {
                return
            }
            
            const index = this.currentDay.habits.findIndex(h => h.habitId === habitId)
            if (index !== -1) {
                this.currentDay.habits.splice(index, 1)
                this.saveToLocalStorage()
            }
        },
        // Проверка, отмечена ли привычка на текущий день
        isHabitMarked(habitId) {
            if (!this.currentDay || !this.currentDay.habits) {
                return false
            }
            return this.currentDay.habits.some(h => h.habitId === habitId)
        },
        // Отметить срыв (сбросить таймер)
        markRelapse(habitId, day, month, year) {
            const habit = this.habits.find(h => h.id === habitId)
            if (!habit) return
            
            const now = new Date()
            habit.lastRelapse = now.toISOString()
            
            // Добавляем дату срыва в массив
            const relapseDate = {
                day: day || now.getDate(),
                month: (month || now.getMonth() + 1),
                year: year || now.getFullYear(),
                timestamp: now.toISOString()
            }
            
            // Проверяем, нет ли уже такого срыва
            if (!habit.relapses) {
                habit.relapses = []
            }
            
            const existingRelapse = habit.relapses.find(r => 
                r.day === relapseDate.day && 
                r.month === relapseDate.month && 
                r.year === relapseDate.year
            )
            
            if (!existingRelapse) {
                habit.relapses.push(relapseDate)
            }
            
            // Удаляем все отметки этой привычки из календаря (успешные дни)
            this.calendar = this.calendar.map(day => {
                if (day.habits) {
                    day.habits = day.habits.filter(h => h.habitId !== habitId)
                }
                return day
            })
            
            this.saveToLocalStorage()
        },
        // Получить даты срывов для привычки
        getRelapseDates(habitId) {
            const habit = this.habits.find(h => h.id === habitId)
            if (!habit || !habit.relapses) return []
            return habit.relapses
        },
        // Сохранение в localStorage
        saveToLocalStorage() {
            localStorage.setItem('habits_data', JSON.stringify(this.habits))
            localStorage.setItem('habits_calendar', JSON.stringify(this.calendar))
            localStorage.setItem('habits_currentDay', JSON.stringify(this.currentDay))
        }
    },
    getters: {
        // Получить привычку по ID
        getHabitById: (state) => (habitId) => {
            if (!habitId) return null
            // Преобразуем ID в число для сравнения
            const numId = typeof habitId === 'string' ? parseInt(habitId, 10) : habitId
            return state.habits.find(h => h.id === numId || h.id === habitId)
        },
        // Получить все отметки для конкретной привычки
        getHabitMarks: (state) => (habitId) => {
            const marks = []
            for (const day of state.calendar) {
                if (day.habits) {
                    const dayMark = day.habits.find(h => h.habitId === habitId)
                    if (dayMark) {
                        marks.push({
                            date: day.date,
                            time: dayMark.time
                        })
                    }
                }
            }
            return marks
        },
        // Получить время без привычки (в миллисекундах)
        getTimeWithoutHabit: (state) => (habitId) => {
            const habit = state.habits.find(h => h.id === habitId)
            if (!habit) return 0
            
            if (habit.lastRelapse) {
                // Если был срыв, считаем от последнего срыва
                return Date.now() - new Date(habit.lastRelapse).getTime()
            } else {
                // Если срыва не было, считаем от создания привычки
                return Date.now() - new Date(habit.createdAt).getTime()
            }
        }
    }
})

