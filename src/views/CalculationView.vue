<script setup>
    import AppCalculationForm from '../components/AppCalculationForm.vue'
    import { useCalculationStore } from '../store/calculation'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'

    const calculationStore = useCalculationStore()
    const { personalData } = storeToRefs(calculationStore)
    const i18nStore = useI18nStore()
    const t = i18nStore.t
</script>

<template>
    <h1>{{ t('calculation.title') }}</h1>
    
    <!-- Форма для расчета РСК -->
    <app-calculation-form  class="form"/>

    <!-- Результат расчета. По умолчанию норма - 2200 Ккал -->
    <h3 v-show="personalData.dailyIntake">
        {{ t('calculation.result').replace('{value}', personalData.dailyIntake) }}
    </h3>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .form {
        margin-bottom: $margin-bottom;
    }
</style>