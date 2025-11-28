import { defineStore } from 'pinia'

export const useCalculationStore = defineStore('calculation', {
  state: () => {
    // Загружаем данные из localStorage при инициализации
    const savedPersonalData = localStorage.getItem('calculation_personalData')
    
    return {
      personalData: savedPersonalData ? JSON.parse(savedPersonalData) : {
        age: null,
        weight: null,
        height: null,
        sex: null,
        activity: null,
        dailyIntake: 0
      }
    }
  },
  actions: {
    // Расчет суточной нормы калорий
    calculateDailyIntake() {
      if (this.personalData.sex === 'male') {
        this.personalData.dailyIntake = parseInt((10 * this.personalData.weight + 6.25 * this.personalData.height - 5 * this.personalData.age + 5) * this.personalData.activity)
      } else if (this.personalData.sex === 'female') {
        this.personalData.dailyIntake = parseInt((10 * this.personalData.weight + 6.25 * this.personalData.height - 5 * this.personalData.age - 161) * this.personalData.activity)
      }
      
      // Сохраняем в localStorage
      this.saveToLocalStorage()
      
      return this.personalData.dailyIntake
    },
    saveToLocalStorage() {
      localStorage.setItem('calculation_personalData', JSON.stringify(this.personalData))
    },
    updatePersonalData(data) {
      this.personalData = { ...this.personalData, ...data }
      this.saveToLocalStorage()
    }
  }
})