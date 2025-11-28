<script setup>
    import { storeToRefs } from 'pinia'
    import { useCalculationStore } from '../store/calculation'
    import { useCalendarStore } from '../store/calendar'
    import { useI18nStore } from '../store/i18n'

    const { personalData } = useCalculationStore()
    
    const calendarStore = useCalendarStore()
    const { currentDay } = storeToRefs(calendarStore)
    const i18nStore = useI18nStore()
    const t = i18nStore.t
</script>

<template>
    <div class="summary">
        <a-progress 
            class="summary__progress-bar"
            v-if="personalData.dailyIntake > 0"
            :percent="Math.round(100 * currentDay.total.calories / personalData.dailyIntake)" 
        />
        
        <h2 class="summary__title">{{ t('home.summary') }}</h2>
        
        <table class="summary__table table">
            <tr v-if="personalData.dailyIntake > 0">
                <td>{{ t('home.remaining') }}</td>
                <td>{{ personalData.dailyIntake - currentDay.total.calories }}</td>
            </tr>
            <tr>
                <td>{{ t('home.consumed') }}</td>
                <td>{{ currentDay.total.calories }}</td>
            </tr>
            <tr v-if="personalData.dailyIntake > 0">
                <td>{{ Math.round(100 * currentDay.total.calories / personalData.dailyIntake) }} {{ t('home.percent') }}</td>
                <td>{{ personalData.dailyIntake }}</td>
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
        width: 250px;
    }

    td {
        padding: 5px 0;
    }
</style>