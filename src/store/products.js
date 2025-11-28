import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
    state: () => {
        // Загружаем продукты из localStorage при инициализации
        const savedProducts = localStorage.getItem('products_data')
        return {
            products: savedProducts ? JSON.parse(savedProducts) : [],
            keyword: ''
        }
    },
    getters: {
        // Фильтрация продуктов для поиска в справочнике
        filteredProducts() {
            return this.products.filter(
                product => product.name.toLowerCase().startsWith(this.keyword.toLowerCase())
            )
        }
    },
    actions: {
        addProducts(products) {
            // Добавляем только те продукты, которых еще нет
            for (let i in products) {
                const exists = this.products.find(p => p.name === products[i].name)
                if (!exists) {
                    this.products.push(products[i])
                }
            }
            this.saveToLocalStorage()
        },
        // Добавление продукта в справочник
        addProduct(product) {
            this.products.push(product)
            this.saveToLocalStorage()
        },
        updateKeyword(keyword) {
            this.keyword = keyword || ''
        },
        saveToLocalStorage() {
            localStorage.setItem('products_data', JSON.stringify(this.products))
        }
    }
})