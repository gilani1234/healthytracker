<script setup>
    import { computed, reactive, onMounted } from 'vue'
    import { useCalculationStore } from '../store/calculation'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'
    
    const calculationStore = useCalculationStore()
    const { personalData } = storeToRefs(calculationStore)
    const { calculateDailyIntake, updatePersonalData } = calculationStore
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const form = reactive({
        age: '',
        weight: '',
        height: '',
        sex: '',
        activity: ''
    })

    // Загружаем данные из store при монтировании
    onMounted(() => {
        if (personalData.age) form.age = personalData.age
        if (personalData.weight) form.weight = personalData.weight
        if (personalData.height) form.height = personalData.height
        if (personalData.sex) form.sex = personalData.sex
        if (personalData.activity) form.activity = personalData.activity
    })

    const setPersonalData = () => {
        updatePersonalData({
            age: form.age,
            weight: form.weight,
            height: form.height,
            sex: form.sex,
            activity: form.activity
        })

        calculateDailyIntake()
    }

    const isFormInvalid = computed(() => {
        return !form.age || !form.weight || !form.height || !form.sex || !form.activity
    })
</script>

<template>
    <!-- Расчет суточной нормы калорий -->
    <a-form>
        <a-form-item :label="t('calculation.age')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
            <a-input-number min="1" max="100" v-model:value="form.age"/>
        </a-form-item>
        <a-form-item :label="t('calculation.weight')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
            <a-input-number :min="5" v-model:value="form.weight"/>
        </a-form-item>
        <a-form-item :label="t('calculation.height')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
            <a-input-number :min="40" :max="300" v-model:value="form.height"/>
        </a-form-item>
        <a-form-item class="field-group" :label="t('calculation.sex')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
            <a-radio-group class="field-group__list" v-model:value="form.sex">
                <a-radio :value="`male`">{{ t('calculation.male') }}</a-radio>
                <a-radio :value="`female`">{{ t('calculation.female') }}</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item class="field-group" :label="t('calculation.activity')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
            <a-radio-group class="field-group__list" v-model:value="form.activity">
                <a-radio :value="1.2">{{ t('calculation.minimal') }}</a-radio>
                <a-radio :value="1.375">{{ t('calculation.light') }}</a-radio>
                <a-radio :value="1.55">{{ t('calculation.moderate') }}</a-radio>
                <a-radio :value="1.7">{{ t('calculation.heavy') }}</a-radio>
                <a-radio :value="1.9">{{ t('calculation.extreme') }}</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-button 
            class="btn"
            type="primary" 
            @click="setPersonalData()"
            :disabled="isFormInvalid"
        >
            {{ t('calculation.calculate') }}
        </a-button>
    </a-form>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/mixins.scss";
    
    .field-group {
        align-items: baseline;
    }
    .field-group__list {
        @include column;
    }
</style>