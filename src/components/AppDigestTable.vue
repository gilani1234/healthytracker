<script setup>
    import { defineProps, computed } from 'vue'
    import { useI18nStore } from '../store/i18n'

    const { tableData } = defineProps(['tableData'])
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const columns = computed(() => [
        { name: 'Таблица БЖУ', dataIndex: 'name', key: 'name' }, 
        { title: t('digest.calories'), dataIndex: 'calories', key: 'calories' },
        { title: t('digest.proteins'), dataIndex: 'proteins', key: 'proteins' }, 
        { title: t('digest.fats'), dataIndex: 'fats', key: 'fats' },
        { title: t('digest.carbs'), dataIndex: 'carbs', key: 'carbs' }
    ])
</script>

<template>
    <!-- Таблица для справочника (без указания массы) -->
    <a-table :columns="columns" :data-source="tableData">
        <template #headerCell="{ column }">
            <template v-if="column.key === 'name'">
                <span>
                    {{ t('digest.food') }}
                </span>
            </template>
        </template>
        
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
                <a>
                    {{ record.name }}
                </a>
            </template>
        </template>
    </a-table> 
</template>
