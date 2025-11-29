<script setup>
    import { useCalendarStore } from '../store/calendar'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'

    const calendarStore = useCalendarStore()
    const { currentDay } = storeToRefs(calendarStore)
    const i18nStore = useI18nStore()
    const t = i18nStore.t
</script>

<template>
    <!-- Общее количество КБЖУ за день -->
    <div class="total">
        <a-statistic class="total__item" :title="t('home.calories')" :value="currentDay.total.calories"></a-statistic>
        <a-statistic class="total__item" :title="t('home.proteins')" :value="currentDay.total.proteins"></a-statistic>
        <a-statistic class="total__item" :title="t('home.fats')" :value="currentDay.total.fats"></a-statistic>
        <a-statistic class="total__item" :title="t('home.carbs')" :value="currentDay.total.carbs"></a-statistic>
    </div>
</template>

<style lang="scss" scoped>
    .total {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }

    .total__item {
        flex: 1;
        min-width: 120px;
    }
</style>