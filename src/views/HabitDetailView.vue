<script setup>
    import { ref, computed, onMounted, onUnmounted, watch, h } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useHabitsStore } from '../store/habits'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'
    import { Modal } from 'ant-design-vue'
    import dayjs from 'dayjs'
    import formatDateMixin from '../mixins/FormatDateMixin'

    const { formatDate } = formatDateMixin.methods
    const route = useRoute()
    const router = useRouter()
    
    const habitsStore = useHabitsStore()
    const { habits, calendar } = storeToRefs(habitsStore)
    const { markRelapse, markHabitSuccess, unmarkHabitSuccess, setCurrentDay, getRelapseDates } = habitsStore
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const habitId = computed(() => {
        const id = route.params.id
        // Пробуем преобразовать в число
        const numId = typeof id === 'string' ? parseInt(id, 10) : id
        return isNaN(numId) ? null : numId
    })
    const habit = computed(() => {
        if (!habitId.value) return null
        return habitsStore.getHabitById(habitId.value)
    })
    
    const selectedDate = ref(dayjs())
    const timerInterval = ref(null)
    const timeWithoutHabit = ref(0)

    // Получаем все отметки для этой привычки
    const habitMarks = computed(() => {
        return habitsStore.getHabitMarks(habitId.value)
    })

    // Получаем даты срывов
    const relapseDates = computed(() => {
        if (!habitId.value) return []
        return habitsStore.getRelapseDates(habitId.value)
    })

    // Проверяем, отмечен ли день (успешный день)
    const isDateMarked = (date) => {
        try {
            if (!date || !habitMarks.value || habitMarks.value.length === 0) return false
            const dateObj = date.toDate ? date.toDate() : date
            const { day, month, year } = formatDate(dateObj)
            return habitMarks.value.some(mark => 
                mark.date && mark.date.day === day && 
                mark.date.month === month && 
                mark.date.year === year
            )
        } catch (e) {
            console.error('Error checking date mark:', e)
            return false
        }
    }

    // Проверяем, является ли день днем срыва
    const isRelapseDate = (date) => {
        try {
            if (!date || !relapseDates.value || relapseDates.value.length === 0) return false
            const dateObj = date.toDate ? date.toDate() : date
            const { day, month, year } = formatDate(dateObj)
            const isRelapse = relapseDates.value.some(relapse => 
                relapse.day === day && 
                relapse.month === month && 
                relapse.year === year
            )
            return isRelapse
        } catch (e) {
            console.error('Error checking relapse date:', e)
            return false
        }
    }

    // Обработка выбора даты в календаре
    const handleDateSelect = (date) => {
        try {
            if (!date || !habitId.value) return
            
            const dateObj = date.toDate ? date.toDate() : date
            const { day, month, year } = formatDate(dateObj)
            
            // Сначала устанавливаем текущий день
            setCurrentDay(day, month, year)
            
            // Затем переключаем отметку
            if (isDateMarked(date)) {
                unmarkHabitSuccess(habitId.value)
            } else {
                markHabitSuccess(habitId.value)
            }
        } catch (e) {
            console.error('Error handling date select:', e)
        }
    }

    // Обновление таймера
    const updateTimer = () => {
        if (habit.value) {
            timeWithoutHabit.value = habitsStore.getTimeWithoutHabit(habitId.value)
        }
    }

    // Форматирование времени
    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        const months = Math.floor(days / 30)
        const years = Math.floor(days / 365)

        if (years > 0) {
            return `${years} ${years === 1 ? t('habits.year') : t('habits.years')}`
        } else if (months > 0) {
            return `${months} ${months === 1 ? t('habits.month') : t('habits.months')}`
        } else if (days > 0) {
            return `${days} ${days === 1 ? t('habits.day') : t('habits.days')}`
        } else if (hours > 0) {
            return `${hours} ${hours === 1 ? t('habits.hour') : t('habits.hours')}`
        } else if (minutes > 0) {
            return `${minutes} ${minutes === 1 ? t('habits.minute') : t('habits.minutes')}`
        } else {
            return `${seconds} ${seconds === 1 ? t('habits.second') : t('habits.seconds')}`
        }
    }

    // Детальное время
    const detailedTime = computed(() => {
        const ms = timeWithoutHabit.value
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        
        return {
            days: days,
            hours: hours % 24,
            minutes: minutes % 60,
            seconds: seconds % 60
        }
    })

    // Обработка срыва
    const handleRelapse = () => {
        Modal.confirm({
            title: t('habits.confirmRelapse'),
            content: t('habits.confirmRelapseText'),
            okText: t('habits.confirm'),
            cancelText: t('habits.cancel'),
            okButtonProps: { danger: true },
            onOk() {
                const now = new Date()
                const { day, month, year } = formatDate(now)
                markRelapse(habitId.value, day, month, year)
                updateTimer()
            }
        })
    }

    // Календарь с отметками
    const disabledDate = (current) => {
        // Можно отмечать только прошедшие и сегодняшний день
        return current && current > dayjs().endOf('day')
    }

    const dateCellRender = (current) => {
        if (isRelapseDate(current)) {
            const emoji = habit.value?.emoji || '🚫'
            return h('div', {
                class: 'relapse-date',
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px',
                    zIndex: 10,
                    pointerEvents: 'none',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: '50%',
                    border: '2px solid #ff4d4f',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }
            }, emoji)
        } else if (isDateMarked(current)) {
            return h('div', {
                class: 'marked-date',
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#52c41a',
                    zIndex: 10,
                    pointerEvents: 'none'
                }
            }, '✓')
        }
        return null
    }

    onMounted(() => {
        // Даем время store загрузиться
        setTimeout(() => {
            // Проверяем существование привычки после монтирования
            if (!habit.value || !habitId.value) {
                router.push('/habits')
                return
            }
            
            try {
                updateTimer()
                // Обновляем таймер каждую секунду
                timerInterval.value = setInterval(updateTimer, 1000)
            } catch (e) {
                console.error('Error initializing timer:', e)
            }
        }, 50)
    })

    onUnmounted(() => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
        }
    })

    // Отслеживаем изменения привычки (на случай если она будет удалена)
    watch([habit, habitId], ([newHabit, newHabitId]) => {
        // Не делаем редирект сразу, даем компоненту время загрузиться
        if (newHabitId && !newHabit) {
            setTimeout(() => {
                // Проверяем еще раз перед редиректом
                const currentHabit = habitsStore.getHabitById(newHabitId)
                if (!currentHabit) {
                    router.push('/habits')
                }
            }, 500)
        }
    }, { immediate: false })
</script>

<template>
    <div v-if="!habitId" class="loading-state">
        <p>Загрузка...</p>
    </div>
    <div class="habit-detail" v-else-if="habit && habitId">
        <!-- Заголовок -->
        <div class="habit-detail__header">
            <a-button 
                type="text" 
                @click="router.push('/habits')"
                class="back-btn"
            >
                ← {{ t('habits.back') }}
            </a-button>
            <div class="habit-detail__title-wrapper">
                <span class="habit-detail__emoji">{{ habit.emoji || '🚫' }}</span>
                <h1 class="habit-detail__title">{{ habit.name }}</h1>
            </div>
            <p v-if="habit.description" class="habit-detail__description">
                {{ habit.description }}
            </p>
        </div>

        <!-- Таймер -->
        <div class="habit-detail__timer">
            <div class="timer-card">
                <h2 class="timer-title">{{ t('habits.timeWithoutHabit') }}</h2>
                <div class="timer-display">
                    <div class="timer-main">{{ formatTime(timeWithoutHabit) }}</div>
                    <div class="timer-detailed" v-if="timeWithoutHabit > 0">
                        <div class="timer-item">
                            <span class="timer-value">{{ detailedTime.days }}</span>
                            <span class="timer-label">{{ t('habits.days') }}</span>
                        </div>
                        <div class="timer-item">
                            <span class="timer-value">{{ detailedTime.hours }}</span>
                            <span class="timer-label">{{ t('habits.hours') }}</span>
                        </div>
                        <div class="timer-item">
                            <span class="timer-value">{{ detailedTime.minutes }}</span>
                            <span class="timer-label">{{ t('habits.minutes') }}</span>
                        </div>
                        <div class="timer-item">
                            <span class="timer-value">{{ detailedTime.seconds }}</span>
                            <span class="timer-label">{{ t('habits.seconds') }}</span>
                        </div>
                    </div>
                </div>
                <a-button 
                    type="primary" 
                    danger 
                    size="large"
                    @click="handleRelapse"
                    class="relapse-btn"
                >
                    {{ t('habits.relapse') }}
                </a-button>
            </div>
        </div>

        <!-- Календарь -->
        <div class="habit-detail__calendar">
            <h2 class="calendar-title">{{ t('habits.calendar') }}</h2>
            <p class="calendar-hint">{{ t('habits.calendarHint') }}</p>
            <a-calendar
                v-model:value="selectedDate"
                :disabled-date="disabledDate"
                :date-cell-render="dateCellRender"
                @select="handleDateSelect"
                class="calendar"
            />
        </div>
    </div>
    <div v-else class="error-state">
        <p>Привычка не найдена</p>
        <a-button type="primary" @click="router.push('/habits')">
            Вернуться к списку привычек
        </a-button>
    </div>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .habit-detail {
        animation: fadeIn 0.5s ease-in;
        width: 100%;
        overflow: visible;
        min-height: auto;
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

    .habit-detail__header {
        text-align: center;
        margin-bottom: 32px;
        position: relative;
    }

    .habit-detail__title-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 12px;
    }

    .habit-detail__emoji {
        font-size: 48px;
        line-height: 1;
    }

    .back-btn {
        position: absolute;
        left: 0;
        top: 0;
        color: #1890ff;
        font-size: 16px;
        padding: 0;
    }

    .habit-detail__title {
        font-size: 32px;
        font-weight: 600;
        color: #1890ff;
        margin: 16px 0;
    }

    .habit-detail__description {
        font-size: 16px;
        color: #666;
        margin-top: 8px;
    }

    .habit-detail__timer {
        margin-bottom: 32px;
    }

    .timer-card {
        padding: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        text-align: center;
        color: white;
    }

    .timer-title {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 24px;
        color: rgba(255, 255, 255, 0.9);
    }

    .timer-display {
        margin-bottom: 32px;
    }

    .timer-main {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 16px;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .timer-detailed {
        display: flex;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;
    }

    .timer-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .timer-value {
        font-size: 32px;
        font-weight: 600;
    }

    .timer-label {
        font-size: 14px;
        opacity: 0.8;
    }

    .relapse-btn {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        padding: 0 32px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .habit-detail__calendar {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: visible;
        min-height: auto;
    }

    .calendar-title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
    }

    .calendar-hint {
        font-size: 14px;
        color: #666;
        margin-bottom: 20px;
    }

    .calendar {
        width: 100%;
        overflow: visible;
        
        :deep(.ant-picker-panel) {
            overflow: visible;
        }
        
        :deep(.ant-picker-body) {
            overflow: visible;
        }
        
        :deep(.ant-picker-content) {
            overflow: visible;
        }
        
        :deep(.marked-date) {
            background: rgba(82, 196, 26, 0.12) !important;
            color: #52c41a !important;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            border: 1.5px solid rgba(82, 196, 26, 0.25);
        }

        :deep(.relapse-date) {
            background: white !important;
            border-radius: 50% !important;
            font-size: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid #ff4d4f !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            width: 32px !important;
            height: 32px !important;
            padding: 0 !important;
        }

        :deep(.ant-picker-cell-selected .marked-date) {
            background: rgba(24, 144, 255, 0.15) !important;
            color: #1890ff !important;
            border-color: rgba(24, 144, 255, 0.35);
        }

        :deep(.ant-picker-cell-selected .relapse-date) {
            background: white !important;
            border-color: #ff4d4f !important;
            box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3) !important;
        }

        :deep(.ant-picker-cell:hover .relapse-date) {
            transform: translate(-50%, -50%) scale(1.1) !important;
            box-shadow: 0 3px 8px rgba(255, 77, 79, 0.4) !important;
        }
    }

    .loading-state,
    .error-state {
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }

    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    @media (max-width: 768px) {
        .timer-main {
            font-size: 36px;
        }

        .timer-value {
            font-size: 24px;
        }

        .timer-detailed {
            gap: 16px;
        }

        .back-btn {
            position: relative;
            margin-bottom: 16px;
        }
    }
</style>

