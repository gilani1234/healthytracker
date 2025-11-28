import { defineStore } from 'pinia'

export const useWaterStore = defineStore('water', {
    state: () => {
        // Загружаем данные из localStorage при инициализации
        const savedCalendar = localStorage.getItem('water_calendar')
        const savedCurrentDay = localStorage.getItem('water_currentDay')
        const savedDailyGoal = localStorage.getItem('water_dailyGoal')
        
        return {
            calendar: savedCalendar ? JSON.parse(savedCalendar) : [],
            currentDay: savedCurrentDay ? JSON.parse(savedCurrentDay) : {},
            dailyGoal: savedDailyGoal ? parseInt(savedDailyGoal) : 2000 // Цель в миллилитрах (2 литра по умолчанию)
        }
    },
    actions: {
        setCurrentDay(day, month, year) {
            // Поиск дня в calendar (используем строгое сравнение)
            const selectedDay = this.calendar.find((element) => 
                element.date.day === day && 
                element.date.month === month && 
                element.date.year === year
            )

            if (selectedDay) {
                // Если найден, установить как текущий (currentDay)
                this.currentDay = selectedDay
            } else {
                // Если не найден, добавить новый день в calendar и установить в текущий
                const newCalendarDay = {
                    date: {
                        day: day,
                        month: month,
                        year: year
                    },
                    waterIntake: 0, // Потребление воды в миллилитрах
                    glasses: [] // Массив выпитых стаканов
                }
                
                this.calendar.push(newCalendarDay)
                this.currentDay = newCalendarDay
            }
            
            // Сохраняем в localStorage
            this.saveToLocalStorage()
        },
        addWater(amount) {
            // Убеждаемся, что currentDay существует и является объектом из calendar
            if (!this.currentDay || !this.currentDay.date) {
                return
            }
            
            // Добавление воды (по умолчанию стакан = 250мл)
            this.currentDay.waterIntake = (this.currentDay.waterIntake || 0) + amount
            
            if (!this.currentDay.glasses) {
                this.currentDay.glasses = []
            }
            
            this.currentDay.glasses.push({
                amount: amount,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            })
            
            // Сохраняем в localStorage
            this.saveToLocalStorage()
        },
        removeWater(glassIndex) {
            // Удаление стакана воды
            if (this.currentDay.glasses[glassIndex]) {
                this.currentDay.waterIntake -= this.currentDay.glasses[glassIndex].amount
                this.currentDay.glasses.splice(glassIndex, 1)
                
                if (this.currentDay.waterIntake < 0) {
                    this.currentDay.waterIntake = 0
                }
            }
            
            // Сохраняем в localStorage
            this.saveToLocalStorage()
        },
        setDailyGoal(goal) {
            this.dailyGoal = goal
            // Сохраняем в localStorage
            this.saveToLocalStorage()
        },
        saveToLocalStorage() {
            localStorage.setItem('water_calendar', JSON.stringify(this.calendar))
            localStorage.setItem('water_currentDay', JSON.stringify(this.currentDay))
            localStorage.setItem('water_dailyGoal', this.dailyGoal.toString())
        },
        getWaterPerDays(dates) {
            const waterPerDaysArray = []

            // Массив с общим количеством воды из диапазона дат
            for (let i = 0; i < dates.length; i++) {
                const currentDay = this.calendar.find(
                    (element) => element.date.day === dates[i].day  &&
                    element.date.month === dates[i].month &&
                    element.date.year === dates[i].year 
                )
                if (currentDay && currentDay.waterIntake !== undefined) {
                    waterPerDaysArray[i] = currentDay.waterIntake
                } else {
                    waterPerDaysArray[i] = 0
                }                
            }

            return waterPerDaysArray
        }
    },
    getters: {
        waterPercentage() {
            if (this.dailyGoal === 0 || !this.currentDay || !this.currentDay.waterIntake) return 0
            return Math.min(100, Math.round((this.currentDay.waterIntake / this.dailyGoal) * 100))
        },
        remainingWater() {
            if (!this.currentDay || !this.currentDay.waterIntake) return this.dailyGoal
            return Math.max(0, this.dailyGoal - this.currentDay.waterIntake)
        }
    }
})

