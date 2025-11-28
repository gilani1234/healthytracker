<script setup>
    import formatDateMixin from '../mixins/FormatDateMixin'
    import { ref, computed } from 'vue'
    import dayjs from 'dayjs'
    import { useWaterStore } from '../store/water'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'
    import waterEmpty from '../assets/icons/water-empty.png'
    import waterFilled from '../assets/icons/water-filled.png'

    const { formatDate } = formatDateMixin.methods

    const waterStore = useWaterStore()
    const { currentDay, dailyGoal } = storeToRefs(waterStore)
    const { setCurrentDay, addWater, removeWater, setDailyGoal } = waterStore
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const date = ref(dayjs())
    const isLoaded = ref(false)
    const glassSize = ref(250) // Размер стакана в мл
    const customAmount = ref('')

    const setDate = () => {
        if (date.value) {
            const { day, month, year } = formatDate(date.value.$d)
            setCurrentDay(day, month, year)
        }
    }

    // Установка текущей даты при первом запуске 
    if (!isLoaded.value) {
        setDate()
        isLoaded.value = true
    }

    const addGlass = (amount) => {
        addWater(amount)
    }

    const removeGlass = (index) => {
        removeWater(index)
    }

    const addCustomAmount = () => {
        const amount = parseInt(customAmount.value)
        if (amount && amount > 0) {
            addWater(amount)
            customAmount.value = ''
        }
    }

    const waterPercentage = computed(() => {
        if (dailyGoal.value === 0) return 0
        return Math.min(100, Math.round((currentDay.value.waterIntake / dailyGoal.value) * 100))
    })

    const remainingWater = computed(() => {
        return Math.max(0, dailyGoal.value - currentDay.value.waterIntake)
    })

    const glassesToShow = computed(() => {
        const totalGlasses = Math.ceil(dailyGoal.value / glassSize.value)
        const filledGlasses = Math.floor((currentDay.value.waterIntake || 0) / glassSize.value)
        return { total: totalGlasses, filled: filledGlasses }
    })

    const handleGlassClick = (index) => {
        // Вычисляем количество воды для этого стакана
        const glassAmount = (index + 1) * glassSize.value
        
        if (index < glassesToShow.value.filled) {
            // Если стакан заполнен, нужно найти и удалить соответствующий стакан из истории
            // Ищем стакан, который заполняет этот индекс
            if (currentDay.value.glasses && currentDay.value.glasses.length > 0) {
                // Находим индекс стакана, который соответствует этому объему
                let totalAmount = 0
                let glassIndexToRemove = -1
                
                for (let i = 0; i < currentDay.value.glasses.length; i++) {
                    totalAmount += currentDay.value.glasses[i].amount
                    if (totalAmount >= glassAmount) {
                        glassIndexToRemove = i
                        break
                    }
                }
                
                if (glassIndexToRemove >= 0) {
                    removeGlass(glassIndexToRemove)
                } else {
                    // Если не нашли точный стакан, удаляем последний
                    removeGlass(currentDay.value.glasses.length - 1)
                }
            }
        } else {
            // Если стакан пустой, добавляем воду в количестве, соответствующем этому стакану
            // Но нужно добавить только разницу до нужного уровня
            const currentAmount = currentDay.value.waterIntake || 0
            const targetAmount = glassAmount
            const amountToAdd = targetAmount - currentAmount
            
            if (amountToAdd > 0) {
                addGlass(amountToAdd)
            }
        }
    }
</script>

<template>
    <div class="water-tracker">
        <h1 class="water-tracker__title">{{ t('water.title') }}</h1>

        <!-- Выбор даты -->
        <div class="water-tracker__datepicker">
            <a-date-picker 
                v-model:value="date"
                :placeholder="t('water.selectDate')"
                @change="setDate"
                class="date-picker"
            />
        </div>

        <div v-if="date" class="water-tracker__content">
            <!-- Настройка цели -->
            <div class="water-tracker__goal">
                <a-input-number
                    v-model:value="dailyGoal"
                    :min="500"
                    :max="5000"
                    :step="100"
                    addon-after="мл"
                    class="goal-input"
                    @change="setDailyGoal(dailyGoal)"
                />
                <span class="goal-label">{{ t('water.dailyGoal') }}</span>
            </div>

            <!-- Прогресс -->
            <div class="water-tracker__progress">
                <a-progress 
                    :percent="waterPercentage"
                    :stroke-color="{
                        '0%': '#87d068',
                        '50%': '#2db7f5',
                        '100%': '#1890ff',
                    }"
                    :show-info="true"
                    class="progress-bar"
                />
                <div class="progress-info">
                    <div class="progress-info__item">
                        <span class="label">{{ t('water.drunk') }}</span>
                        <span class="value">{{ currentDay.waterIntake || 0 }} мл</span>
                    </div>
                    <div class="progress-info__item">
                        <span class="label">{{ t('water.remaining') }}</span>
                        <span class="value">{{ remainingWater }} мл</span>
                    </div>
                    <div class="progress-info__item">
                        <span class="label">{{ t('water.goal') }}</span>
                        <span class="value">{{ dailyGoal }} мл</span>
                    </div>
                </div>
            </div>

            <!-- Визуализация стаканов -->
            <div class="water-tracker__glasses">
                <h3>{{ t('water.glasses') }}</h3>
                <div class="glasses-grid">
                    <div 
                        v-for="(glass, index) in glassesToShow.total" 
                        :key="index"
                        class="glass-item"
                        @click="handleGlassClick(index)"
                    >
                        <img 
                            :src="index < glassesToShow.filled ? waterFilled : waterEmpty" 
                            :alt="index < glassesToShow.filled ? 'Полный стакан' : 'Пустой стакан'"
                            class="glass-image"
                        />
                        <span class="glass-label">{{ (index + 1) * glassSize }}мл</span>
                    </div>
                </div>
            </div>

            <!-- Быстрое добавление -->
            <div class="water-tracker__quick-add">
                <h3>{{ t('water.quickAdd') }}</h3>
                <div class="quick-buttons">
                    <a-button 
                        type="primary" 
                        @click="addGlass(250)"
                        class="quick-btn"
                    >
                        +250 мл
                    </a-button>
                    <a-button 
                        type="primary" 
                        @click="addGlass(500)"
                        class="quick-btn"
                    >
                        +500 мл
                    </a-button>
                    <a-button 
                        type="primary" 
                        @click="addGlass(750)"
                        class="quick-btn"
                    >
                        +750 мл
                    </a-button>
                </div>
            </div>

            <!-- Кастомное количество -->
            <div class="water-tracker__custom">
                <h3>{{ t('water.custom') }}</h3>
                <div class="custom-input-group">
                    <a-input-number
                        v-model:value="customAmount"
                        :min="1"
                        :max="2000"
                        :step="50"
                        :placeholder="t('water.customPlaceholder')"
                        addon-after="мл"
                        class="custom-input"
                    />
                    <a-button 
                        type="primary" 
                        @click="addCustomAmount"
                        :disabled="!customAmount || customAmount <= 0"
                        class="custom-btn"
                    >
                        {{ t('water.add') }}
                    </a-button>
                </div>
            </div>

            <!-- История -->
            <div class="water-tracker__history" v-if="currentDay.glasses && currentDay.glasses.length > 0">
                <h3>{{ t('water.history') }}</h3>
                <a-list 
                    :data-source="currentDay.glasses"
                    class="history-list"
                >
                    <template #renderItem="{ item, index }">
                        <a-list-item class="history-item">
                            <a-list-item-meta>
                                <template #title>
                                    <span>{{ item.amount }} мл</span>
                                </template>
                                <template #description>
                                    <span>{{ item.time }}</span>
                                </template>
                            </a-list-item-meta>
                            <template #actions>
                                <a-button 
                                    type="text" 
                                    danger 
                                    @click="removeGlass(index)"
                                    class="remove-btn"
                                >
                                    {{ t('water.delete') }}
                                </a-button>
                            </template>
                        </a-list-item>
                    </template>
                </a-list>
            </div>
        </div>
        
        <h3 v-else class="water-tracker__empty">{{ t('water.selectDatePrompt') }}</h3>
    </div>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .water-tracker {
        animation: fadeIn 0.5s ease-in;
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

    .water-tracker__title {
        font-size: 28px;
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 24px;
        text-align: center;
    }

    .water-tracker__datepicker {
        margin-bottom: 24px;
        display: flex;
        justify-content: center;
    }

    .date-picker {
        width: 200px;
    }

    .water-tracker__content {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .water-tracker__goal {
        display: flex;
        align-items: center;
        gap: 16px;
        justify-content: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .goal-input {
        width: 150px;
    }

    .goal-label {
        color: white;
        font-size: 16px;
        font-weight: 500;
    }

    .water-tracker__progress {
        padding: 24px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .progress-bar {
        margin-bottom: 20px;
    }

    .progress-info {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 16px;
    }

    .progress-info__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .progress-info__item .label {
        font-size: 14px;
        color: #666;
    }

    .progress-info__item .value {
        font-size: 20px;
        font-weight: 600;
        color: #1890ff;
    }

    .water-tracker__glasses {
        text-align: center;
    }

    .water-tracker__glasses h3 {
        margin-bottom: 20px;
        color: #333;
    }

    .glasses-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 20px;
        max-width: 600px;
        margin: 0 auto;
    }

    .glass-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: transform 0.2s ease;
        padding: 10px;
        border-radius: 8px;
    }

    .glass-item:hover {
        transform: scale(1.1);
        background: rgba(24, 144, 255, 0.1);
    }

    .glass-image {
        width: 60px;
        height: 60px;
        object-fit: contain;
        transition: filter 0.2s ease;
    }

    .glass-item:hover .glass-image {
        filter: drop-shadow(0 4px 8px rgba(24, 144, 255, 0.3));
    }

    .glass-label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
    }

    .water-tracker__quick-add,
    .water-tracker__custom {
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .water-tracker__quick-add h3,
    .water-tracker__custom h3 {
        margin-bottom: 16px;
        color: #333;
    }

    .quick-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .quick-btn {
        min-width: 100px;
        height: 40px;
        font-size: 16px;
        border-radius: 8px;
    }

    .custom-input-group {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }

    .custom-input {
        flex: 1;
        min-width: 200px;
    }

    .custom-btn {
        height: 40px;
        padding: 0 24px;
    }

    .water-tracker__history {
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .water-tracker__history h3 {
        margin-bottom: 16px;
        color: #333;
    }

    .history-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .history-item {
        border-bottom: 1px solid #f0f0f0;
    }

    .remove-btn {
        color: #ff4d4f;
    }

    .water-tracker__empty {
        text-align: center;
        color: #999;
        margin-top: 40px;
    }

    @media (max-width: 768px) {
        .glasses-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 15px;
        }

        .glass-image {
            width: 50px;
            height: 50px;
        }

        .custom-input-group {
            flex-direction: column;
        }

        .custom-input {
            width: 100%;
        }

        .custom-btn {
            width: 100%;
        }
    }
</style>

