<script setup>
    import AppDailyTable from '../components/AppDailyTable.vue'
    import AppDailyModal from '../components/AppDailyModal.vue'
    import { ref, computed } from 'vue'
    import { useI18nStore } from '../store/i18n'

    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const mealTabList = computed(() => [
        { key: 'breakfast', tab: t('home.breakfast') }, 
        { key: 'lunch', tab: t('home.lunch') }, 
        { key: 'dinner', tab: t('home.dinner') }
    ])

    const mealTabKey = ref('breakfast')

    const onTabChange = (value, type) => (type === 'key') ? key.value = value : mealTabKey.value = value
</script>

<template>
    <a-card
        :tab-list="mealTabList"
        v-model:mealTabKey="mealTabKey"
        @tabChange="key => onTabChange(key, 'mealTabKey')"
    >
        <!-- Табы для выбора приема пищи -->
        <div key="breakfast" v-if="mealTabKey === 'breakfast'">
            <app-daily-modal class="modal" :meal="`breakfast`"/>
            <app-daily-table :meal="`breakfast`"/>
        </div>
        <div key="lunch" v-else-if="mealTabKey === 'lunch'">
            <app-daily-modal class="modal" :meal="`lunch`"/>
            <app-daily-table :meal="`lunch`"/>
        </div>
        <div key="dinner" v-else>
            <app-daily-modal class="modal" :meal="`dinner`"/>
            <app-daily-table :meal="`dinner`"/>
        </div>
    </a-card>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";
    
    .modal {
        margin-bottom: $margin-bottom;
    }
</style>
