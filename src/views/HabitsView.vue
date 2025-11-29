<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useHabitsStore } from '../store/habits'
    import { useI18nStore } from '../store/i18n'
    import { storeToRefs } from 'pinia'
    import { Modal } from 'ant-design-vue'

    const router = useRouter()
    const habitsStore = useHabitsStore()
    const { habits } = storeToRefs(habitsStore)
    const { addHabit, removeHabit } = habitsStore
    const i18nStore = useI18nStore()
    const t = i18nStore.t

    const newHabitName = ref('')
    const newHabitDescription = ref('')
    const newHabitEmoji = ref('🚫')
    const showAddModal = ref(false)

    // Популярные эмодзи для вредных привычек
    const emojiOptions = [
        '🚫', '🚬', '🍷', '🍺', '☕', '🍰', '🍔', '🍟', 
        '🍕', '🍫', '🍭', '🍪', '💻', '📱', '🎮', '😴'
    ]

    const handleAddHabit = () => {
        if (newHabitName.value.trim()) {
            addHabit(newHabitName.value.trim(), newHabitDescription.value.trim(), newHabitEmoji.value)
            newHabitName.value = ''
            newHabitDescription.value = ''
            newHabitEmoji.value = '🚫'
            showAddModal.value = false
        }
    }

    const handleRemoveHabit = (habitId, event) => {
        // Предотвращаем всплытие события
        if (event) {
            event.stopPropagation()
        }
        try {
            Modal.confirm({
                title: t('habits.confirmDelete'),
                content: t('habits.confirmDeleteText'),
                okText: t('habits.delete'),
                cancelText: t('habits.cancel'),
                onOk() {
                    removeHabit(habitId)
                }
            })
        } catch (e) {
            console.error('Error removing habit:', e)
        }
    }

    const handleHabitClick = (habitId, event) => {
        // Предотвращаем всплытие события
        if (event) {
            event.stopPropagation()
        }
        try {
            router.push(`/habits/${habitId}`)
        } catch (e) {
            console.error('Error navigating to habit:', e)
        }
    }
</script>

<template>
    <div class="habits-tracker">
        <h1 class="habits-tracker__title">{{ t('habits.title') }}</h1>

        <div class="habits-tracker__content">
            <!-- Кнопка добавления привычки -->
            <div class="habits-tracker__add-section">
                <a-button 
                    type="primary" 
                    size="large"
                    @click="showAddModal = true"
                    class="add-habit-btn"
                >
                    <template #icon>
                        <span>+</span>
                    </template>
                    {{ t('habits.addHabit') }}
                </a-button>
            </div>

            <!-- Список привычек -->
            <div v-if="habits.length > 0" class="habits-tracker__habits">
                <div 
                    v-for="habit in habits" 
                    :key="habit.id"
                    class="habit-card"
                    @click="handleHabitClick(habit.id, $event)"
                >
                    <div class="habit-card__header">
                        <div class="habit-card__name-wrapper">
                            <span class="habit-card__emoji">{{ habit.emoji || '🚫' }}</span>
                            <h3 class="habit-card__name">{{ habit.name }}</h3>
                        </div>
                        <a-button 
                            type="text" 
                            danger 
                            @click="handleRemoveHabit(habit.id, $event)"
                            class="remove-habit-btn"
                        >
                            {{ t('habits.delete') }}
                        </a-button>
                    </div>
                    
                    <p v-if="habit.description" class="habit-card__description">
                        {{ habit.description }}
                    </p>

                    <!-- Подсказка для клика -->
                    <div class="habit-card__hint">
                        <span class="hint-text">{{ t('habits.clickToView') }}</span>
                    </div>
                </div>
            </div>

            <!-- Пустое состояние -->
            <div v-else class="habits-tracker__empty">
                <p class="empty-text">{{ t('habits.noHabits') }}</p>
                <p class="empty-hint">{{ t('habits.addFirstHabit') }}</p>
            </div>
        </div>

        <!-- Модальное окно добавления привычки -->
        <a-modal
            v-model:visible="showAddModal"
            :title="t('habits.addHabit')"
            :ok-text="t('habits.add')"
            :cancel-text="t('habits.cancel')"
            @ok="handleAddHabit"
        >
            <div class="add-habit-form">
                <div class="form-item">
                    <label class="form-label">{{ t('habits.habitName') }}</label>
                    <a-input
                        v-model:value="newHabitName"
                        :placeholder="t('habits.habitNamePlaceholder')"
                        @pressEnter="handleAddHabit"
                        class="form-input"
                    />
                </div>
                <div class="form-item">
                    <label class="form-label">{{ t('habits.description') }} ({{ t('habits.optional') }})</label>
                    <a-textarea
                        v-model:value="newHabitDescription"
                        :placeholder="t('habits.descriptionPlaceholder')"
                        :rows="3"
                        class="form-textarea"
                    />
                </div>
                <div class="form-item">
                    <label class="form-label">Эмодзи</label>
                    <div class="emoji-selector">
                        <div 
                            v-for="emoji in emojiOptions" 
                            :key="emoji"
                            class="emoji-option"
                            :class="{ 'emoji-option--selected': newHabitEmoji === emoji }"
                            @click="newHabitEmoji = emoji"
                        >
                            {{ emoji }}
                        </div>
                    </div>
                    <div class="emoji-preview">
                        <span class="emoji-preview__label">Выбрано:</span>
                        <span class="emoji-preview__value">{{ newHabitEmoji }}</span>
                    </div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<style lang="scss" scoped>
    @import "src/assets/scss/variables.scss";

    .habits-tracker {
        animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .habits-tracker__title {
        font-size: 28px;
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 24px;
        text-align: center;
    }

    .habits-tracker__content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .habits-tracker__add-section {
        display: flex;
        justify-content: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .add-habit-btn {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        padding: 0 32px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .habits-tracker__habits {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }

    .habit-card {
        padding: 24px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 2px solid transparent;
        cursor: pointer;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            border-color: #1890ff;
        }
    }

    .habit-card__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
    }

    .habit-card__name-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }

    .habit-card__emoji {
        font-size: 28px;
        line-height: 1;
    }

    .habit-card__name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0;
        flex: 1;
    }

    .remove-habit-btn {
        color: #ff4d4f;
        padding: 0;
        height: auto;
    }

    .habit-card__description {
        color: #666;
        font-size: 14px;
        margin-bottom: 16px;
        line-height: 1.5;
    }

    .habit-card__hint {
        display: flex;
        justify-content: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
    }

    .hint-text {
        font-size: 14px;
        color: #1890ff;
        font-style: italic;
    }

    .habits-tracker__empty {
        text-align: center;
        padding: 60px 20px;
        color: #999;
    }

    .empty-text {
        font-size: 18px;
        margin-bottom: 8px;
    }

    .empty-hint {
        font-size: 14px;
        color: #bbb;
    }

    .add-habit-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-label {
        font-weight: 500;
        color: #333;
    }

    .form-input,
    .form-textarea {
        border-radius: 6px;
    }

    .emoji-selector {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 8px;
        margin-bottom: 12px;
    }

    .emoji-option {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        font-size: 24px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;

        &:hover {
            border-color: #1890ff;
            transform: scale(1.1);
            background: #f0f7ff;
        }

        &--selected {
            border-color: #1890ff;
            background: #e6f7ff;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
        }
    }

    .emoji-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 6px;
    }

    .emoji-preview__label {
        font-size: 14px;
        color: #666;
    }

    .emoji-preview__value {
        font-size: 24px;
    }

    @media (max-width: 768px) {
        .habits-tracker__habits {
            grid-template-columns: 1fr;
        }

        .emoji-selector {
            grid-template-columns: repeat(6, 1fr);
        }
    }
</style>

