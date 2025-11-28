<script setup>
    import { ref, computed, onMounted, onUnmounted, onActivated, watch } from 'vue'
    import { useHabitsStore } from '../store/habits'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'
    import dayjs from 'dayjs'
    import formatDateMixin from '../mixins/FormatDateMixin'

    const { formatDate } = formatDateMixin.methods
    const habitsStore = useHabitsStore()
    const i18nStore = useI18nStore()
    
    // Делаем переводы реактивными - используем storeToRefs для реактивности locale
    const { locale } = storeToRefs(i18nStore)
    
    // Функция перевода, которая реактивно обновляется при смене языка
    const t = (key) => {
        // Используем locale.value для реактивности - это заставит Vue пересчитать при изменении языка
        const _ = locale.value
        const translations = i18nStore.translations
        const keys = key.split('.')
        let value = translations
        for (const k of keys) {
            value = value?.[k]
            if (value === undefined) return key
        }
        return value || key
    }
    const { habits, activeHabits, trackedDays, selectedHabitId } = storeToRefs(habitsStore)
    const { 
        addActiveHabit, 
        removeActiveHabit, 
        toggleDay,
        markDay,
        markRelapse,
        setSelectedHabit,
        deleteHabit
    } = habitsStore

    const selectedMonth = ref(dayjs())
    const showHabitSelection = ref(false)
    const startDate = ref(null)
    const showCustomHabitModal = ref(false)
    const showDeleteConfirm = ref(false)
    const habitToDelete = ref(null)
    const customHabitForm = ref({
        title: '',
        description: '',
        icon: '🎯',
        color: '#667eea'
    })

    // Текущая выбранная привычка для отображения
    const activeHabit = computed(() => {
        if (selectedHabitId.value) {
            return habits.value.find(h => h.id === selectedHabitId.value) || null
        }
        return activeHabits.value.length > 0 ? habits.value.find(h => h.id === activeHabits.value[0]) : null
    })

    // Список всех активных привычек
    const activeHabitsList = computed(() => {
        return activeHabits.value.map(id => habits.value.find(h => h.id === id)).filter(Boolean)
    })

    // Функция для получения переведенного названия привычки (реактивно обновляется при смене языка)
    const getHabitTitle = (habit) => {
        if (!habit) return ''
        // Используем locale.value для реактивности
        const _ = locale.value
        // Для предустановленных привычек используем переводы
        if (habit.id === 1) return t('habits.alcohol.title')
        if (habit.id === 2) return t('habits.smoking.title')
        if (habit.id === 3) return t('habits.fastFood.title')
        // Для пользовательских привычек возвращаем оригинальное название
        return habit.title
    }

    // Функция для получения переведенного описания привычки (реактивно обновляется при смене языка)
    const getHabitDescription = (habit) => {
        if (!habit) return ''
        // Используем locale.value для реактивности
        const _ = locale.value
        // Для предустановленных привычек используем переводы
        if (habit.id === 1) return t('habits.alcohol.description')
        if (habit.id === 2) return t('habits.smoking.description')
        if (habit.id === 3) return t('habits.fastFood.description')
        // Для пользовательских привычек возвращаем оригинальное описание
        return habit.description
    }

    // Загрузка даты начала отслеживания для выбранной привычки
    const loadStartDate = () => {
        if (activeHabit.value) {
            const habitId = activeHabit.value.id
            const savedStartDate = localStorage.getItem(`habit_start_${habitId}`)
            if (savedStartDate) {
                // Парсим дату с временем или только дату
                startDate.value = dayjs(savedStartDate)
            } else {
                const newDate = dayjs()
                startDate.value = newDate
                // Сохраняем дату с временем
                localStorage.setItem(`habit_start_${habitId}`, newDate.format('YYYY-MM-DD HH:mm:ss'))
            }
        }
    }

    // Если нет активной привычки, показываем выбор
    onMounted(() => {
        if (activeHabits.value.length === 0) {
            showHabitSelection.value = true
        } else {
            // Устанавливаем выбранную привычку, если её нет
            if (!selectedHabitId.value) {
                setSelectedHabit(activeHabits.value[0])
            }
            loadStartDate()
            // Запускаем таймер
            startTimer()
        }
    })

    // Обновляем дату при изменении выбранной привычки
    watch([selectedHabitId, () => activeHabit.value], () => {
        if (activeHabit.value) {
            loadStartDate()
            if (!timerInterval) {
                startTimer()
            }
        }
    }, { immediate: false })

    // Используем onActivated для обновления при возврате на страницу
    onActivated(() => {
        if (activeHabits.value.length > 0) {
            if (!selectedHabitId.value) {
                setSelectedHabit(activeHabits.value[0])
            }
            loadStartDate()
            if (!timerInterval) {
                startTimer()
            }
        }
    })

    const selectHabit = (habitId) => {
        // Если привычка уже активна, просто переключаемся на неё
        if (activeHabits.value.includes(habitId)) {
            setSelectedHabit(habitId)
            loadStartDate()
            showHabitSelection.value = false
            if (!timerInterval) {
                startTimer()
            }
            return
        }
        
        // Добавляем новую привычку (не удаляем старые)
        addActiveHabit(habitId)
        setSelectedHabit(habitId)
        
        // Проверяем, есть ли уже сохраненная дата для этой привычки
        const savedStartDate = localStorage.getItem(`habit_start_${habitId}`)
        if (!savedStartDate) {
            // Если нет, создаем новую дату начала
            const newDate = dayjs()
            startDate.value = newDate
            localStorage.setItem(`habit_start_${habitId}`, newDate.format('YYYY-MM-DD HH:mm:ss'))
        } else {
            // Если есть, загружаем её
            loadStartDate()
        }
        
        showHabitSelection.value = false
        
        // Запускаем таймер
        if (!timerInterval) {
            startTimer()
        }
    }

    const changeHabit = () => {
        showHabitSelection.value = true
    }

    const switchToHabit = (habitId) => {
        setSelectedHabit(habitId)
        loadStartDate()
    }

    const confirmDeleteHabit = (habitId) => {
        habitToDelete.value = habitId
        showDeleteConfirm.value = true
    }

    const deleteHabitConfirmed = () => {
        if (habitToDelete.value) {
            deleteHabit(habitToDelete.value)
            habitToDelete.value = null
            showDeleteConfirm.value = false
            
            // Если удалили текущую привычку, выбираем другую или показываем выбор
            if (activeHabits.value.length === 0) {
                showHabitSelection.value = true
            } else {
                setSelectedHabit(activeHabits.value[0])
                loadStartDate()
            }
        }
    }

    const formatDateString = (date) => {
        if (dayjs.isDayjs(date)) {
            return date.format('YYYY-MM-DD')
        }
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const onDateClick = (date) => {
        if (!activeHabit.value) return
        
        const dateString = formatDateString(date)
        toggleDay(activeHabit.value.id, dateString)
    }

    // Вычисляем статистику
    const streakDays = computed(() => {
        if (!activeHabit.value || !startDate.value) return 0
        
        const habitDays = trackedDays.value[activeHabit.value.id] || {}
        const today = dayjs()
        let streak = 0
        let checkDate = today
        
        // Проверяем с сегодня назад
        while (true) {
            const dateString = formatDateString(checkDate)
            if (habitDays[dateString] === true) {
                streak++
                checkDate = checkDate.subtract(1, 'day')
            } else {
                break
            }
        }
        
        return streak
    })

    const totalDays = computed(() => {
        if (!activeHabit.value) return 0
        const habitDays = trackedDays.value[activeHabit.value.id] || {}
        return Object.keys(habitDays).filter(date => habitDays[date] === true).length
    })

    const resetTimer = () => {
        if (!activeHabit.value) return
        
        // Подтверждение сброса
        if (confirm(t('badHabits.resetConfirm'))) {
            const habitId = activeHabit.value.id
            const newDate = dayjs()
            startDate.value = newDate
            // Сохраняем дату с временем
            const dateString = newDate.format('YYYY-MM-DD HH:mm:ss')
            localStorage.setItem(`habit_start_${habitId}`, dateString)
            forceUpdate.value++
        }
    }

    const markRelapseDay = () => {
        if (!activeHabit.value) return
        
        // Подтверждение срыва
        if (confirm(t('badHabits.relapsedConfirm'))) {
            const habitId = activeHabit.value.id
            const today = dayjs()
            const dateString = formatDateString(today)
            
            // Отмечаем день как срыв
            markRelapse(habitId, dateString)
            
            // Сбрасываем таймер
            const newDate = dayjs()
            startDate.value = newDate
            // Сохраняем дату с временем
            const dateTimeString = newDate.format('YYYY-MM-DD HH:mm:ss')
            localStorage.setItem(`habit_start_${habitId}`, dateTimeString)
            forceUpdate.value++
        }
    }

    // Время с начала отслеживания
    const timeSinceStart = computed(() => {
        // Используем forceUpdate для реактивности
        const _ = forceUpdate.value
        
        // Всегда загружаем актуальную дату из localStorage для выбранной привычки
        if (activeHabit.value) {
            const habitId = activeHabit.value.id
            const savedStartDate = localStorage.getItem(`habit_start_${habitId}`)
            if (savedStartDate) {
                // Парсим дату - поддерживаем оба формата (с временем и без)
                let savedDate
                if (savedStartDate.includes(' ')) {
                    // Формат с временем
                    savedDate = dayjs(savedStartDate, 'YYYY-MM-DD HH:mm:ss')
                } else {
                    // Старый формат только с датой - считаем от начала дня
                    savedDate = dayjs(savedStartDate + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss')
                }
                
                const now = dayjs()
                const diff = now.diff(savedDate, 'second')
                
                // Если разница отрицательная или слишком большая, сбрасываем
                if (diff < 0 || diff > 31536000) { // Больше года
                    const newDate = dayjs()
                    localStorage.setItem(`habit_start_${habitId}`, newDate.format('YYYY-MM-DD HH:mm:ss'))
                    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
                }
                
                const days = Math.floor(diff / 86400)
                const hours = Math.floor((diff % 86400) / 3600)
                const minutes = Math.floor((diff % 3600) / 60)
                const seconds = diff % 60
                
                return { days, hours, minutes, seconds }
            }
        }
        
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    })

    // Генерируем календарь на месяц
    const calendarDays = computed(() => {
        if (!selectedMonth.value) return []
        
        const monthStart = selectedMonth.value.startOf('month')
        const monthEnd = selectedMonth.value.endOf('month')
        const startDay = monthStart.day() === 0 ? 7 : monthStart.day() // Понедельник = 1
        const daysInMonth = monthEnd.date()
        
        const days = []
        
        // Дни предыдущего месяца
        const prevMonth = monthStart.subtract(1, 'month')
        const daysInPrevMonth = prevMonth.daysInMonth()
        for (let i = startDay - 2; i >= 0; i--) {
            const date = prevMonth.date(daysInPrevMonth - i)
            days.push({
                date,
                isCurrentMonth: false,
                isToday: date.isSame(dayjs(), 'day'),
                isTracked: activeHabit.value ? isDayTracked(date) : false,
                isRelapse: activeHabit.value ? isDayRelapse(date) : false
            })
        }
        
        // Дни текущего месяца
        for (let i = 1; i <= daysInMonth; i++) {
            const date = monthStart.date(i)
            days.push({
                date,
                isCurrentMonth: true,
                isToday: date.isSame(dayjs(), 'day'),
                isTracked: activeHabit.value ? isDayTracked(date) : false,
                isRelapse: activeHabit.value ? isDayRelapse(date) : false
            })
        }
        
        // Дни следующего месяца
        const remainingDays = 42 - days.length // 6 недель * 7 дней
        const nextMonth = monthEnd.add(1, 'day')
        for (let i = 1; i <= remainingDays; i++) {
            const date = nextMonth.date(i)
            days.push({
                date,
                isCurrentMonth: false,
                isToday: date.isSame(dayjs(), 'day'),
                isTracked: activeHabit.value ? isDayTracked(date) : false,
                isRelapse: activeHabit.value ? isDayRelapse(date) : false
            })
        }
        
        return days
    })

    const isDayTracked = (date) => {
        if (!activeHabit.value) return false
        const dateString = formatDateString(date)
        const habitDays = trackedDays.value[activeHabit.value.id] || {}
        return habitDays[dateString] === true
    }

    const isDayRelapse = (date) => {
        if (!activeHabit.value) return false
        const dateString = formatDateString(date)
        const habitDays = trackedDays.value[activeHabit.value.id] || {}
        return habitDays[dateString] === 'relapse'
    }

    const changeMonth = (direction) => {
        if (direction === 'prev') {
            selectedMonth.value = selectedMonth.value.subtract(1, 'month')
        } else {
            selectedMonth.value = selectedMonth.value.add(1, 'month')
        }
    }

    const openCustomHabitModal = () => {
        showCustomHabitModal.value = true
        customHabitForm.value = {
            title: '',
            description: '',
            icon: '🎯',
            color: '#667eea'
        }
    }

    const createCustomHabit = () => {
        if (!customHabitForm.value.title.trim()) {
            return
        }
        
        const habitId = habitsStore.addCustomHabit(
            customHabitForm.value.title.trim(),
            customHabitForm.value.description.trim(),
            customHabitForm.value.icon,
            customHabitForm.value.color
        )
        
        showCustomHabitModal.value = false
        selectHabit(habitId)
    }

    const availableIcons = ['🎯', '🚫', '💔', '😔', '⏰', '📱', '💻', '🎮', '🍕', '☕', '🍫', '🍪', '🎲', '💸', '📺', '🚬', '🍷', '🍔', '🥤', '🍰', '🍟', '🍕', '🍺', '🥃', '💊', '💉', '🎰', '🎲', '📵']
    const availableColors = ['#667eea', '#ff6b6b', '#4ecdc4', '#ffa726', '#ab47bc', '#66bb6a', '#ef5350', '#f093fb', '#4facfe']

    const monthNames = computed(() => {
        if (i18nStore.locale === 'en') {
            return ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
        }
        return ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
               'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    })
    const dayNames = computed(() => {
        if (i18nStore.locale === 'en') {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }
        return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    })

    // Обновление таймера каждую секунду
    let timerInterval = null
    const forceUpdate = ref(0)

    const startTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval)
        }
        timerInterval = setInterval(() => {
            forceUpdate.value++
        }, 1000)
    }

    onUnmounted(() => {
        if (timerInterval) {
            clearInterval(timerInterval)
        }
    })
</script>

<template>
    <div class="bad-habits">
        <div class="bad-habits__header">
            <h1 class="bad-habits__title">{{ t('menu.badHabits') }}</h1>
        </div>

        <!-- Выбор привычки -->
        <div v-if="showHabitSelection || !activeHabit" class="habit-selection">
            <h2 class="selection-title">{{ t('badHabits.selectHabit') }}</h2>
            <div class="habits-grid">
                <div 
                    v-for="habit in habits" 
                    :key="habit.id"
                    class="habit-card"
                    :style="{ borderColor: habit.color }"
                    :class="{ 'habit-card--active': activeHabits.includes(habit.id) }"
                    @click="selectHabit(habit.id)"
                >
                    <div class="habit-card__icon" :style="{ color: habit.color }">
                        {{ habit.icon }}
                    </div>
                    <h3 class="habit-card__title">{{ getHabitTitle(habit) }}</h3>
                    <p v-if="getHabitDescription(habit)" class="habit-card__description">{{ getHabitDescription(habit) }}</p>
                    <div v-if="activeHabits.includes(habit.id)" class="habit-card__badge">
                        ✓ {{ t('badHabits.active') }}
                    </div>
                </div>
                <!-- Кнопка добавления своей привычки -->
                <div 
                    class="habit-card habit-card--add"
                    @click="openCustomHabitModal"
                >
                    <div class="habit-card__icon habit-card__icon--add">+</div>
                    <h3 class="habit-card__title">{{ t('badHabits.customHabit') }}</h3>
                    <p class="habit-card__description">{{ t('badHabits.createCustom') }}</p>
                </div>
            </div>
        </div>

        <!-- Трекер привычки -->
        <div v-else class="habit-tracker">
            <!-- Список активных привычек -->
            <div v-if="activeHabitsList.length > 1" class="active-habits-list">
                <div class="habits-tabs">
                    <div 
                        v-for="habit in activeHabitsList" 
                        :key="habit.id"
                        class="habit-tab"
                        :class="{ 'habit-tab--active': activeHabit && activeHabit.id === habit.id }"
                        @click="switchToHabit(habit.id)"
                    >
                        <span class="habit-tab__icon">{{ habit.icon }}</span>
                        <span class="habit-tab__title">{{ getHabitTitle(habit) }}</span>
                    </div>
                </div>
            </div>

            <!-- Информация о текущей привычке -->
            <div class="current-habit">
                <div class="current-habit__header">
                    <div class="current-habit__info">
                        <div class="habit-icon-large" :style="{ color: activeHabit.color }">
                            {{ activeHabit.icon }}
                        </div>
                        <div>
                            <h2 class="current-habit__title">{{ getHabitTitle(activeHabit) }}</h2>
                            <p v-if="getHabitDescription(activeHabit)" class="current-habit__description">{{ getHabitDescription(activeHabit) }}</p>
                        </div>
                    </div>
                    <div class="current-habit__actions">
                        <a-button type="default" @click="changeHabit" class="change-btn">
                            {{ t('badHabits.change') }}
                        </a-button>
                        <a-button 
                            type="default" 
                            danger 
                            @click="confirmDeleteHabit(activeHabit.id)" 
                            class="delete-btn"
                        >
                            {{ t('badHabits.delete') }}
                        </a-button>
                    </div>
                </div>

                <!-- Таймер -->
                <div class="timer-section">
                    <div class="timer-label">{{ t('badHabits.timer') }}</div>
                    <div class="timer-display">
                        <div class="timer-item">
                            <span class="timer-value">{{ timeSinceStart.days }}</span>
                            <span class="timer-unit">{{ t('badHabits.days') }}</span>
                        </div>
                        <div class="timer-separator">:</div>
                        <div class="timer-item">
                            <span class="timer-value">{{ String(timeSinceStart.hours).padStart(2, '0') }}</span>
                            <span class="timer-unit">{{ t('badHabits.hours') }}</span>
                        </div>
                        <div class="timer-separator">:</div>
                        <div class="timer-item">
                            <span class="timer-value">{{ String(timeSinceStart.minutes).padStart(2, '0') }}</span>
                            <span class="timer-unit">{{ t('badHabits.minutes') }}</span>
                        </div>
                        <div class="timer-separator">:</div>
                        <div class="timer-item">
                            <span class="timer-value">{{ String(timeSinceStart.seconds).padStart(2, '0') }}</span>
                            <span class="timer-unit">{{ t('badHabits.seconds') }}</span>
                        </div>
                    </div>
                    <div class="timer-buttons">
                        <a-button 
                            type="primary" 
                            danger 
                            @click="resetTimer" 
                            class="reset-btn"
                        >
                            {{ t('badHabits.resetTimer') }}
                        </a-button>
                        <a-button 
                            type="primary" 
                            danger 
                            @click="markRelapseDay" 
                            class="relapse-btn"
                        >
                            {{ t('badHabits.relapsed') }}
                        </a-button>
                    </div>
                </div>

                <!-- Статистика -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-content">
                            <div class="stat-value">{{ streakDays }}</div>
                            <div class="stat-label">{{ t('badHabits.streak') }}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-content">
                            <div class="stat-value">{{ totalDays }}</div>
                            <div class="stat-label">{{ t('badHabits.totalDays') }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Календарь -->
            <div class="calendar-section">
                <div class="calendar-header">
                    <a-button type="text" @click="changeMonth('prev')" class="month-nav">
                        ‹
                    </a-button>
                    <h3 class="calendar-title">
                        {{ monthNames.value[selectedMonth.month()] }} {{ selectedMonth.year() }}
                    </h3>
                    <a-button type="text" @click="changeMonth('next')" class="month-nav">
                        ›
                    </a-button>
                </div>
                <p class="calendar-hint">{{ t('badHabits.selectHabit') }}</p>
                
                <!-- Кастомный календарь -->
                <div class="custom-calendar">
                    <!-- Дни недели -->
                    <div class="calendar-weekdays">
                        <div v-for="dayName in dayNames.value" :key="dayName" class="weekday">
                            {{ dayName }}
                        </div>
                    </div>
                    
                    <!-- Дни месяца -->
                    <div class="calendar-grid">
                        <div 
                            v-for="(day, index) in calendarDays" 
                            :key="index"
                            class="calendar-day"
                            :class="{
                                'calendar-day--other-month': !day.isCurrentMonth,
                                'calendar-day--today': day.isToday,
                                'calendar-day--tracked': day.isTracked,
                                'calendar-day--relapse': day.isRelapse
                            }"
                            @click="onDateClick(day.date)"
                        >
                            <div class="day-number">{{ day.date.date() }}</div>
                            <div v-if="day.isRelapse" class="day-relapse" :style="{ backgroundColor: activeHabit.color }">
                                {{ activeHabit.icon }}
                            </div>
                            <div v-else-if="day.isTracked" class="day-mark" :style="{ backgroundColor: activeHabit.color }">
                                ✓
                            </div>
                            <div v-else-if="day.isCurrentMonth && !day.isToday" class="day-circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно для создания своей привычки -->
        <a-modal
            v-model:visible="showCustomHabitModal"
            :title="t('badHabits.createCustom')"
            @ok="createCustomHabit"
            :ok-button-props="{ disabled: !customHabitForm.title.trim() }"
        >
            <div class="custom-habit-form">
                <div class="form-item">
                    <label>{{ t('badHabits.habitName') }} *</label>
                    <a-input 
                        v-model:value="customHabitForm.title" 
                        :placeholder="t('badHabits.habitName')"
                        :maxlength="50"
                    />
                </div>
                <div class="form-item">
                    <label>{{ t('badHabits.habitDescription') }}</label>
                    <a-textarea 
                        v-model:value="customHabitForm.description" 
                        :placeholder="t('badHabits.habitDescription')"
                        :rows="3"
                        :maxlength="100"
                    />
                </div>
                <div class="form-item">
                    <label>{{ t('badHabits.habitIcon') }}</label>
                    <div class="icon-selector">
                        <div 
                            v-for="icon in availableIcons" 
                            :key="icon"
                            class="icon-option"
                            :class="{ 'icon-option--selected': customHabitForm.icon === icon }"
                            @click="customHabitForm.icon = icon"
                        >
                            {{ icon }}
                        </div>
                    </div>
                </div>
                <div class="form-item">
                    <label>{{ t('badHabits.habitColor') }}</label>
                    <div class="color-selector">
                        <div 
                            v-for="color in availableColors" 
                            :key="color"
                            class="color-option"
                            :class="{ 'color-option--selected': customHabitForm.color === color }"
                            :style="{ backgroundColor: color }"
                            @click="customHabitForm.color = color"
                        ></div>
                    </div>
                </div>
            </div>
        </a-modal>

        <!-- Модальное окно подтверждения удаления -->
        <a-modal
            v-model:visible="showDeleteConfirm"
            :title="t('badHabits.delete')"
            @ok="deleteHabitConfirmed"
            :ok-text="t('badHabits.delete')"
            ok-type="danger"
            :cancel-text="t('badHabits.cancel')"
        >
            <p>{{ t('badHabits.deleteConfirm') }}</p>
        </a-modal>
    </div>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .bad-habits {
        animation: fadeIn 0.5s ease-in;
        padding-bottom: 32px;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .bad-habits__header {
        text-align: center;
        margin-bottom: 40px;
        padding: 24px;
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 159, 64, 0.1) 100%);
        border-radius: 16px;
    }

    .bad-habits__title {
        font-size: 32px;
        font-weight: 700;
        color: #1f2a44;
        margin-bottom: 12px;
    }

    .bad-habits__subtitle {
        font-size: 16px;
        color: #5f6b84;
        line-height: 1.6;
    }

    .habit-selection {
        margin-bottom: 32px;
    }

    .selection-title {
        font-size: 24px;
        font-weight: 600;
        color: #1f2a44;
        text-align: center;
        margin-bottom: 32px;
    }

    .habits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
    }

    .habit-card {
        padding: 24px;
        border-radius: 16px;
        background: white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        text-align: center;
    }

    .habit-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .habit-card__icon {
        font-size: 64px;
        margin-bottom: 16px;
    }

    .habit-card__title {
        font-size: 20px;
        font-weight: 700;
        color: #1f2a44;
        margin-bottom: 8px;
    }

    .habit-card__description {
        font-size: 14px;
        color: #5f6b84;
        line-height: 1.5;
    }

    .habit-card--active {
        border-color: #52c41a !important;
        background: rgba(82, 196, 26, 0.05);
    }

    .habit-card__badge {
        margin-top: 12px;
        padding: 6px 12px;
        background: #52c41a;
        color: white;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .habit-card--add {
        border: 2px dashed #d9d9d9;
        background: #fafafa;
    }

    .habit-card--add:hover {
        border-color: #1890ff;
        background: #f0f8ff;
    }

    .habit-card__icon--add {
        font-size: 48px;
        font-weight: 300;
        color: #1890ff !important;
    }

    .custom-habit-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-item label {
        font-weight: 500;
        color: #1f2a44;
    }

    .icon-selector {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 8px;
    }

    .icon-option {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        border: 2px solid #d9d9d9;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
    }

    .icon-option:hover {
        border-color: #1890ff;
        transform: scale(1.1);
    }

    .icon-option--selected {
        border-color: #1890ff;
        background: #e6f7ff;
    }

    .color-selector {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        gap: 8px;
    }

    .color-option {
        aspect-ratio: 1;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid transparent;
        transition: all 0.2s;
    }

    .color-option:hover {
        transform: scale(1.15);
    }

    .color-option--selected {
        border-color: #1f2a44;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #1f2a44;
    }

    .habit-tracker {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .current-habit {
        padding: 24px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .current-habit__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
    }

    .current-habit__info {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .habit-icon-large {
        font-size: 64px;
    }

    .current-habit__title {
        font-size: 28px;
        font-weight: 700;
        color: #1f2a44;
        margin-bottom: 4px;
    }

    .current-habit__description {
        font-size: 16px;
        color: #5f6b84;
        margin: 0;
    }

    .active-habits-list {
        margin-bottom: 24px;
    }

    .habits-tabs {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        padding: 16px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .habit-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
        background: #f5f7fa;
    }

    .habit-tab:hover {
        background: #e8ecf1;
        transform: translateY(-2px);
    }

    .habit-tab--active {
        border-color: #1890ff;
        background: #e6f7ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    }

    .habit-tab__icon {
        font-size: 20px;
    }

    .habit-tab__title {
        font-weight: 500;
        color: #1f2a44;
    }

    .current-habit__actions {
        display: flex;
        gap: 12px;
    }

    .change-btn,
    .delete-btn {
        height: 40px;
        padding: 0 24px;
    }

    .timer-section {
        text-align: center;
        padding: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        margin-bottom: 24px;
        color: white;
    }

    .timer-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 20px;
    }

    .reset-btn,
    .relapse-btn {
        height: 40px;
        padding: 0 24px;
    }

    .timer-label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .timer-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 8px;
    }

    .timer-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .timer-value {
        font-size: 48px;
        font-weight: 700;
        line-height: 1;
    }

    .timer-unit {
        font-size: 14px;
        opacity: 0.8;
        margin-top: 4px;
    }

    .timer-separator {
        font-size: 32px;
        font-weight: 300;
        opacity: 0.7;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
        border-radius: 12px;
    }

    .stat-icon {
        font-size: 40px;
    }

    .stat-content {
        flex: 1;
    }

    .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #1f2a44;
        line-height: 1;
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 14px;
        color: #5f6b84;
    }

    .calendar-section {
        padding: 16px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    .calendar-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2a44;
        margin: 0;
    }

    .month-nav {
        font-size: 24px;
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .calendar-hint {
        font-size: 12px;
        color: #5f6b84;
        margin-bottom: 16px;
        text-align: center;
    }

    .custom-calendar {
        width: 100%;
    }

    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 4px;
    }

    .weekday {
        text-align: center;
        font-weight: 600;
        font-size: 12px;
        color: #5f6b84;
        padding: 4px;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
    }

    .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s ease;
        min-height: 36px;
    }

    .calendar-day:hover {
        background: #f5f7fa;
    }

    .calendar-day--other-month {
        opacity: 0.3;
    }

    .calendar-day--today {
        background: rgba(24, 144, 255, 0.1);
        border: 2px solid #1890ff;
    }

    .calendar-day--tracked {
        background: rgba(82, 196, 26, 0.1);
    }

    .calendar-day--relapse {
        background: rgba(255, 77, 79, 0.1);
    }

    .day-number {
        font-size: 13px;
        font-weight: 500;
        color: #1f2a44;
        z-index: 1;
    }

    .day-circle {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #d9d9d9;
        background: transparent;
    }

    .day-mark {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 12px;
        border: 2px solid;
    }

    .day-relapse {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 14px;
        border: 2px solid;
    }

    @media (max-width: 768px) {
        .habits-grid {
            grid-template-columns: 1fr;
        }

        .current-habit__header {
            flex-direction: column;
            align-items: flex-start;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .current-habit__info {
            flex-direction: column;
            align-items: flex-start;
        }

        .timer-value {
            font-size: 32px;
        }

        .calendar-day {
            min-height: 32px;
        }
    }
</style>
