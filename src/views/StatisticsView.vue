<script setup>
    import formatDateMixin from '../mixins/FormatDateMixin'
    import { ref, computed } from 'vue'
    import { Bar } from 'vue-chartjs'
    import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
    import { useCalendarStore } from '../store/calendar'
    import { useWaterStore } from '../store/water'
    import { useI18nStore } from '../store/i18n'

    const { formatDate } = formatDateMixin.methods

    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

    const { getCaloriesPerDays } = useCalendarStore()
    const { getWaterPerDays } = useWaterStore()
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const dates = ref(null)
    const selectedType = ref('calories') // 'calories' или 'water'

    // Создание массива с датами из выбранного диапазона
    const createDatesArray = (dates)  => {
        let dateArray = []
        const startDate = dates[0].$d
        const endDate = dates[1].$d
        let currentDate = new Date(startDate.getTime())

        while (currentDate <= endDate) {
            const formattedDate = formatDate(currentDate)
            dateArray.push(formattedDate)
            currentDate.setDate(currentDate.getDate() + 1) 
        }

        return dateArray
    }

    // Форматирование массива дат для вывода графика
    const formatReadableDates = (dateArray) => dateArray.map(({day, month, year}) => `${day}.${month}.${year}`)

    // Обновление данных графика
    const updateChartData = (days, data, label, color) => {
        const datasets = [{ 
            label: label, 
            data: data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2
        }]
        const labels = days
        chartData.value = { labels, datasets }
    }

    const onDatesChange = (value) => {
        dates.value = value
        if (!dates.value) return
        
        const dateArray = createDatesArray(dates.value)
        const readableDates = formatReadableDates(dateArray)
        
        if (selectedType.value === 'calories') {
            const calories = getCaloriesPerDays(dateArray)
            updateChartData(readableDates, calories, t('statistics.calories') + ' (кКал)', 'rgba(255, 99, 132, 0.6)')
        } else {
            const water = getWaterPerDays(dateArray)
            updateChartData(readableDates, water, t('statistics.water') + ' (мл)', 'rgba(54, 162, 235, 0.6)')
        }
    }

    const onTypeChange = () => {
        if (dates.value) {
            onDatesChange(dates.value)
        }
    }

    const chartData = ref()
</script>

<template>
    <div class="statistics">
        <h1 class="statistics__title">{{ t('statistics.title') }}</h1>

        <!-- Выбор типа статистики -->
        <div class="statistics__type-selector">
            <a-radio-group 
                v-model:value="selectedType" 
                @change="onTypeChange"
                class="type-radio-group"
                button-style="solid"
            >
                <a-radio-button value="calories">
                    <span class="radio-label">{{ t('statistics.calories') }}</span>
                </a-radio-button>
                <a-radio-button value="water">
                    <span class="radio-label">{{ t('statistics.water') }}</span>
                </a-radio-button>
            </a-radio-group>
        </div>

        <!-- Выбор дат -->
        <div class="statistics__date-picker">
            <a-range-picker 
                class="range-picker"
                :value="dates"
                @change="onDatesChange"    
            />
        </div>

        <!-- Статистика за выбранный диапазон дат -->
        <div class="statistics__chart">
            <Bar v-if="dates && chartData"
                :data="chartData"
                :options="{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            enabled: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }"
            /> 

            <h3 v-else class="statistics__empty">{{ t('statistics.selectDates') }}</h3>
        </div>     
    </div>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .statistics {
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

    .statistics__title {
        font-size: 28px;
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 24px;
        text-align: center;
    }

    .statistics__type-selector {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
    }

    .type-radio-group {
        background: white;
        padding: 4px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .type-radio-group :deep(.ant-radio-button-wrapper) {
        border-radius: 6px;
        border: none;
        margin: 0 4px;
        transition: all 0.3s ease;
    }

    .type-radio-group :deep(.ant-radio-button-wrapper:hover) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    }

    .type-radio-group :deep(.ant-radio-button-wrapper-checked) {
        background: linear-gradient(135deg, #1890ff 0%, #667eea 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    }

    .radio-label {
        font-weight: 500;
        padding: 0 16px;
    }

    .statistics__date-picker {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
    }

    .range-picker {
        width: 300px;
    }

    .statistics__chart {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .statistics__empty {
        text-align: center;
        color: #999;
        margin: 40px 0;
    }
</style>