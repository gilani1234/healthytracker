import { defineStore } from 'pinia'
import ru from '../locales/ru.json'
import en from '../locales/en.json'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: localStorage.getItem('locale') || 'ru'
  }),

  getters: {
    translations() {
      return this.locale === 'en' ? en : ru
    },

    t() {
      return (key) => {
        const keys = key.split('.')
        let value = this.translations
        for (const k of keys) {
          value = value?.[k]
          if (value === undefined) return key
        }
        return value || key
      }
    }
  },

  actions: {
    setLocale(locale) {
      this.locale = locale
      localStorage.setItem('locale', locale)
    },

    toggleLocale() {
      this.setLocale(this.locale === 'ru' ? 'en' : 'ru')
    }
  }
})


