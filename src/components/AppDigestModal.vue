<script setup>  
    import Modal from '../components/UI/Modal.vue'
    import { reactive, computed } from 'vue'
    import { useProductsStore } from '../store/products'
    import { useI18nStore } from '../store/i18n'
    import resetFormMixin from '../mixins/ResetFormMixin'

    const { resetForm } = resetFormMixin.methods

    const { addProduct } = useProductsStore()
    const i18nStore = useI18nStore()
    const t = i18nStore.t
      
    const form = reactive ({
        name: '',
        calories: null,
        proteins: null,
        fats: null,
        carbs: null
    })

    const isFormInvalid = computed(() => {
        return !form.name || !form.calories || !form.proteins || !form.fats || !form.carbs
    })

    const clickAddBtn = () => {
        const product = {
            name: form.name,
            calories: `${form.calories} кКал`,
            proteins: `${form.proteins} г`,
            fats: `${form.fats} г`,
            carbs: `${form.carbs} г`
        }
        addProduct(product)
    }
</script>

<template>
    <modal 
        :isFormInvalid="isFormInvalid" 
        @clickAddBtn="clickAddBtn"
        @resetForm="resetForm(form)"
    >
        <!-- Добавление нового продукта в справочник -->
        <a-form>
            <a-form-item :label="t('digest.name')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
                <a-input v-model:value="form.name"/>
            </a-form-item>
            <a-form-item :label="t('digest.calories')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
                <a-input-number v-model:value="form.calories" :min="1"/>
            </a-form-item>
            <a-form-item :label="t('digest.proteinsGram')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
                <a-input-number v-model:value="form.proteins" :min="1"/>
            </a-form-item>
            <a-form-item :label="t('digest.fatsGram')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
                <a-input-number v-model:value="form.fats" :min="1"/>
            </a-form-item>
            <a-form-item :label="t('digest.carbsGram')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" :colon="false">
                <a-input-number v-model:value="form.carbs" :min="1"/>
            </a-form-item>
        </a-form>
    </modal>
</template>
