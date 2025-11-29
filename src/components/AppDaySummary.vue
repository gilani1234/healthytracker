<script setup>
    import { computed } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useCalculationStore } from '../store/calculation'
    import { useCalendarStore } from '../store/calendar'
    import { useI18nStore } from '../store/i18n'

    const { personalData } = useCalculationStore()
    
    const calendarStore = useCalendarStore()
    const { currentDay } = storeToRefs(calendarStore)
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    // Вычисляемые значения с проверками
    const consumedCalories = computed(() => {
        return currentDay.value?.total?.calories || 0
    })

    const remainingCalories = computed(() => {
        if (personalData.dailyIntake > 0) {
            return Math.max(0, personalData.dailyIntake - consumedCalories.value)
        }
        return null
    })

    const caloriesPercent = computed(() => {
        if (personalData.dailyIntake > 0 && consumedCalories.value > 0) {
            return Math.round(100 * consumedCalories.value / personalData.dailyIntake)
        }
        return 0
    })

    const progressPercent = computed(() => {
        if (personalData.dailyIntake > 0) {
            return Math.min(100, Math.max(0, caloriesPercent.value))
        }
        return 0
    })
</script>

<template>
    <div class="summary">
        <a-progress 
            class="summary__progress-bar"
            v-if="personalData.dailyIntake > 0"
            :percent="progressPercent" 
        />
        
        <h2 class="summary__title">{{ t('home.summary') }}</h2>
        
        <table class="summary__table table">
            <tr v-if="remainingCalories !== null">
                <td class="summary__label">{{ t('home.remaining') }}</td>
                <td class="summary__value">{{ Math.round(remainingCalories) }} ккал</td>
            </tr>
            <tr>
                <td class="summary__label">{{ t('home.consumed') }}</td>
                <td class="summary__value">{{ Math.round(consumedCalories) }} ккал</td>
            </tr>
            <tr v-if="personalData.dailyIntake > 0">
                <td class="summary__label">{{ caloriesPercent }} {{ t('home.percent') }}</td>
                <td class="summary__value">{{ personalData.dailyIntake }} ккал</td>
            </tr>
        </table>
    </div>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";
    @import "src/assets/scss/mixins.scss";

    .summary {
        @include column;
    }

    .summary__progress-bar {
        margin-bottom: $margin-bottom;
    }

    .summary__table {
        width: 100%;
        border-collapse: collapse;
    }

    .summary__table tr {
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .summary__table tr:last-child {
        border-bottom: none;
    }

    .summary__label {
        padding: 10px 0;
        color: #5f6b84;
        font-size: 15px;
    }

    .summary__value {
        padding: 10px 0;
        text-align: right;
        font-weight: 600;
        color: #1f2a44;
        font-size: 16px;
    }
</style>