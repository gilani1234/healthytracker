import { defineStore } from 'pinia'
import ru from '../locales/ru.json'

export const useI18nStore = defineStore('i18n', {
    state: () => ({
        locale: 'ru'
    }),
    getters: {
        translations() {
            return ru
        },
        t() {
            return (key) => {
                const keys = key.split('.')
                let value = this.translations
                for (const k of keys) {
                    if (value && typeof value === 'object') {
                        value = value[k]
                    } else {
                        return key
                    }
                }
                return typeof value === 'string' ? value : key
            }
        }
    }
})
