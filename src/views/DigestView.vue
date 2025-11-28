<script setup>
    import AppDigestModal from '../components/AppDigestModal.vue'
    import AppDigestTable from '../components/AppDigestTable.vue'
    import { storeToRefs } from 'pinia'
    import { useProductsStore } from '../store/products'
    import { useI18nStore } from '../store/i18n'
    import { onMounted } from 'vue'
   
    const productsStore = useProductsStore()
    
    const { updateKeyword } = productsStore
    const { filteredProducts } = storeToRefs(productsStore)
    const i18nStore = useI18nStore()
    const t = i18nStore.t
    
    // Сбрасываем поиск при монтировании компонента
    onMounted(() => {
        updateKeyword('')
    })
</script>

<template>
    <h1>{{ t('digest.title') }}</h1>
    
    <!-- Добавление нового продукта -->
    <app-digest-modal class="modal"/>

    <!-- Поиск по справочнику -->
    <a-input
        class="search"
        :placeholder="t('digest.search')"
        @input="updateKeyword($event.target.value)"
        @change="updateKeyword($event.target.value)"
    />

    <!-- Справочник -->
    <app-digest-table :tableData="filteredProducts"/>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .modal, .search {
        margin-bottom: $margin-bottom;
    }
</style>
