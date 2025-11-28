<script setup>
    import { ref, defineEmits, defineProps } from 'vue'
    import { useI18nStore } from '../../store/i18n'
    
    const modalVisible = ref(false)

    const props = defineProps(['isFormInvalid'])
    const emits = defineEmits(['clickAddBtn', 'resetForm', 'isFormInvalid'])
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const showModal = () => modalVisible.value = true

    const hideModal = () => {
        modalVisible.value = false
        emits('resetForm')
    }

    const clickAddBtn = () => {
        emits('clickAddBtn')
        hideModal()
    }
</script>

<template>
    <div>
        <a-button type="primary" @click="showModal">
            {{ t('common.add') }}
        </a-button>

        <!-- Модальное окно -->
        <a-modal v-model:visible="modalVisible" :title="t('common.add')">
            <slot></slot>

            <template #footer>
                <a-button key="back" @click="hideModal">{{ t('common.back') }}</a-button>
                <a-button 
                    key="submit" 
                    type="primary" 
                    @click="clickAddBtn"
                    :disabled="isFormInvalid"
                >
                    {{ t('common.add') }}
                </a-button>
            </template>
        </a-modal>
    </div>
</template>