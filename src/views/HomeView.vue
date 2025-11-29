<script setup>
    import formatDateMixin  from '../mixins/FormatDateMixin'
    import AppTotalMacros from '../components/AppTotalMacros.vue'
    import AppMealTabs from '../components/AppMealTabs.vue'
    import AppDaySummary from '../components/AppDaySummary.vue'
    import { ref } from 'vue'
    import dayjs from 'dayjs'
    import { useCalendarStore } from '../store/calendar'
    import { useI18nStore } from '../store/i18n'

    const { formatDate } = formatDateMixin.methods

    const calendarStore = useCalendarStore()
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const date = ref(dayjs())
    const isLoaded = ref(false)

    const setDate = () => {
        if (date.value) {
            const { day, month, year } = formatDate(date.value.$d)
            calendarStore.setCurrentDay(day, month, year)
        } else {
            return
        }
    }   

    // Установка текущей даты при первом запуске 
    if (!isLoaded.value) {
        if (calendarStore.lastSelectedDate) {
            date.value = dayjs(`${calendarStore.lastSelectedDate.year}-${calendarStore.lastSelectedDate.month}-${calendarStore.lastSelectedDate.day}`, 'YYYY-M-D')
        }
        setDate()
        isLoaded.value = true
    }
</script>

<template>
    <div class="nutrition">
        <div class="nutrition__hero">
            <div class="hero-content">
                <p class="hero-label">{{ t('home.title') }}</p>
                <h1 class="hero-title">{{ t('home.subtitle') }}</h1>
                <p class="hero-text">{{ t('home.description') }}</p>
            </div>
            <div class="hero-date">
                <!-- Выбор даты -->
                <a-date-picker 
                    class="datepicker" 
                    v-model:value="date"
                    :placeholder="t('home.selectDate')"
                    @change="setDate"
                />
            </div>
        </div>

        <div v-if="date" class="nutrition__grid">
            <section class="panel macros-panel">
                <h2>{{ t('home.daySummary') }}</h2>
                <app-total-macros />
            </section>

            <section class="panel meals-panel">
                <div class="panel-heading">
                    <h2>{{ t('home.meals') }}</h2>
                </div>
                <app-meal-tabs />
            </section>

            <section class="panel summary-panel">
                <h2>{{ t('home.summary') }}</h2>
                <app-day-summary />
            </section>
        </div>
        
        <h3 v-else class="empty-hint">{{ t('home.selectDate') }}</h3> 
    </div>   
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .nutrition {
        position: relative;
        padding-bottom: 32px;
        max-width: 1400px;
        margin: 0 auto;
        padding-left: 16px;
        padding-right: 16px;
        overflow: hidden;
    }

    .nutrition::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 0% 0%, rgba(255, 187, 92, 0.15), transparent 50%),
            radial-gradient(circle at 90% 10%, rgba(255, 114, 117, 0.15), transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(107, 142, 235, 0.1), transparent 60%),
            #fff9f1;
        z-index: -2;
        pointer-events: none;
    }

    .nutrition::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('https://www.transparenttextures.com/patterns/fabric-of-squares.png');
        opacity: 0.2;
        z-index: -1;
        pointer-events: none;
    }

    .nutrition__hero {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 24px;
        align-items: center;
        padding: 32px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
        margin-bottom: 32px;
        position: relative;
        overflow: hidden;
    }

    .nutrition__hero::after {
        content: '';
        position: absolute;
        right: -60px;
        top: -60px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(255, 214, 153, 0.7) 0%, rgba(255, 214, 153, 0) 70%);
        filter: blur(4px);
    }

    .hero-label {
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 12px;
        color: #ff8159;
        font-weight: 600;
        margin-bottom: 12px;
    }

    .hero-title {
        font-size: clamp(24px, 4vw, 36px);
        font-weight: 700;
        margin-bottom: 12px;
        color: #1f2a44;
        line-height: 1.2;
    }

    .hero-text {
        font-size: 15px;
        color: #5f6b84;
        line-height: 1.5;
    }

    .hero-date {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .datepicker {
        width: 220px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        border-radius: 12px;
    }

    .nutrition__grid {
        display: grid;
        grid-template-columns: 1.5fr 2fr 1.5fr;
        gap: 24px;
        align-items: start;
    }

    .panel {
        padding: 24px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
        backdrop-filter: blur(10px);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        height: 100%;
    }

    .panel:hover {
        transform: translateY(-4px);
        box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
    }

    .panel h2 {
        font-size: 20px;
        font-weight: 700;
        color: #1f2a44;
        margin-bottom: 16px;
    }

    .panel-heading {
        margin-bottom: 20px;
    }

    .panel-sub {
        display: block;
        margin-top: 6px;
        font-size: 14px;
        color: #8892b0;
        line-height: 1.4;
    }

    .empty-hint {
        text-align: center;
        color: #5f6b84;
        padding: 40px 0;
        font-size: 18px;
    }

    @media (max-width: 1200px) {
        .nutrition__grid {
            grid-template-columns: 1fr 1fr;
        }

        .summary-panel {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 768px) {
        .nutrition {
            padding-left: 12px;
            padding-right: 12px;
        }

        .nutrition__hero {
            grid-template-columns: 1fr;
            padding: 24px;
        }

        .hero-date {
            justify-content: flex-start;
        }

        .datepicker {
            width: 100%;
        }

        .nutrition__grid {
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .panel {
            padding: 20px;
        }
    }
</style>