<script setup>
  import "ant-design-vue/dist/antd.css"
  import db from '.././db.json'
  import {RouterView, RouterLink, useRoute} from 'vue-router'
  import { ref, computed } from 'vue'
  import { useProductsStore } from './store/products'
  import { useI18nStore } from './store/i18n'
  import journalIcon from './assets/icons/journal.png'
  import recipeIcon from './assets/icons/recipe.png'
  import rskIcon from './assets/icons/rsk.png'
  import waterFilledIcon from './assets/icons/water-filled.png'
  import carrotIcon from './assets/icons/carrot.svg'
  import favicon from './favicon.ico'
  import backImage from './assets/icons/back.png'

  const { addProducts } = useProductsStore()
  addProducts(db)

  const i18nStore = useI18nStore()
  const t = i18nStore.t

  const route = useRoute()
  
  const routeToKey = {
    '/': '1',
    '/statistics': '2',
    '/digest': '3',
    '/calculation': '4',
    '/water': '5',
    '/habits': '6'
  }

  const selectedPage = computed({
    get: () => [routeToKey[route.path] || '1'],
    set: (value) => {}
  })

  const showMoreMenu = ref(false)
</script>

<template>
  <a-layout class="layout" :style="{ backgroundImage: `url(${backImage})` }">
    <a-layout-header class="layout__header">
      <div class="layout__header-content">
        <!-- Логотип -->
        <div class="layout__logo">
          <img :src="favicon" alt="Логотип" class="logo-img" />
          <span class="logo-text">HealthyTracker</span>
        </div>
        <!-- Главное меню -->
        <a-menu
          class="layout__menu"
          v-model:selectedKeys="selectedPage"
          theme="dark"
          mode="horizontal"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="1">
            <router-link to="/" class="menu-item-link">
              <img :src="journalIcon" :alt="t('menu.home')" class="menu-icon" />
              <span>{{ t('menu.home') }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="4">
            <router-link to="/calculation" class="menu-item-link">
              <img :src="rskIcon" :alt="t('menu.calculation')" class="menu-icon" />
              <span>{{ t('menu.calculation') }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="5">
            <router-link to="/water" class="menu-item-link">
              <img :src="waterFilledIcon" :alt="t('menu.water')" class="menu-icon" />
              <span>{{ t('menu.water') }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="6">
            <router-link to="/habits" class="menu-item-link">
              <span class="menu-icon-emoji">🚫</span>
              <span>{{ t('menu.habits') }}</span>
            </router-link>
          </a-menu-item>
          <!-- Выпадающее меню с дополнительными разделами -->
          <a-menu-item key="more" class="more-menu-item">
            <a-dropdown
              :trigger="['hover']"
              :overlay-style="{ zIndex: 1000 }"
              @visible-change="showMoreMenu = $event"
            >
              <div class="more-menu-trigger">
                <span class="more-dots">⋮</span>
              </div>
              <template #overlay>
                <a-menu class="more-dropdown-menu">
                  <a-menu-item key="2">
                    <router-link to="/statistics" class="menu-item-link">
                      <img :src="carrotIcon" :alt="t('menu.statistics')" class="menu-icon" />
                      <span>{{ t('menu.statistics') }}</span>
                    </router-link>
                  </a-menu-item>
                  <a-menu-item key="3">
                    <router-link to="/digest" class="menu-item-link">
                      <img :src="recipeIcon" :alt="t('menu.digest')" class="menu-icon" />
                      <span>{{ t('menu.digest') }}</span>
                    </router-link>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-menu-item>
        </a-menu>
      </div>
    </a-layout-header>
    <a-layout-content class="layout__content">
      <div class="layout__content-wrapper">
        <RouterView />
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center"/>
  </a-layout>
</template>

<style scoped>
  .layout {
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }

  .layout__header {
    position: fixed; 
    z-index: 1; 
    width: 100%;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.95) 0%, rgba(102, 126, 234, 0.95) 100%) !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  .layout__header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }

  .layout__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 40px;
  }


  .logo-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .logo-text {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #fff 0%, #e8f4f8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .layout__menu {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .layout__menu :deep(.ant-menu-item) {
    border-radius: 8px;
    margin: 0 4px;
    transition: all 0.3s ease;
  }

  .layout__menu :deep(.ant-menu-item:hover) {
    background: rgba(255, 255, 255, 0.15) !important;
    transform: translateY(-2px);
  }

  .layout__menu :deep(.ant-menu-item-selected) {
    background: rgba(255, 255, 255, 0.25) !important;
  }

  .menu-item-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: inherit;
    text-decoration: none;
  }

  .menu-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .menu-icon-emoji {
    font-size: 20px;
    display: inline-block;
    transition: transform 0.2s ease;
  }

  .menu-item-link:hover .menu-icon,
  .menu-item-link:hover .menu-icon-emoji {
    transform: scale(1.15);
    filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5));
  }

  .more-menu-item {
    cursor: pointer;
  }

  .more-menu-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0 16px;
  }

  .more-dots {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    line-height: 1;
    transition: all 0.3s ease;
    user-select: none;
  }

  .more-menu-item:hover .more-dots {
    transform: scale(1.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .more-dropdown-menu {
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.98) 0%, rgba(102, 126, 234, 0.98) 100%);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 0;
    min-width: 180px;
  }

  .more-dropdown-menu :deep(.ant-menu-item) {
    margin: 4px 8px;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .more-dropdown-menu :deep(.ant-menu-item:hover) {
    background: rgba(255, 255, 255, 0.2) !important;
    transform: translateX(4px);
  }

  .layout__content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    margin-top: 90px;
    overflow-y: auto;
    padding: 0 20px;
  }

  .layout__content-wrapper {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 247, 250, 0.98) 100%); 
    padding: 32px;
    min-height: calc(100vh - 120px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    animation: slideUp 0.4s ease-out;
    overflow: visible;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Адаптивность для планшетов и мобильных */
  @media (max-width: 768px) {
    .layout__header-content {
      flex-direction: column;
      padding: 10px;
    }

    .layout__logo {
      margin-right: 0;
      margin-bottom: 10px;
    }

    .logo-text {
      font-size: 18px;
    }

    .layout__menu {
      width: 100%;
    }

    .layout__content {
      width: 100%;
      padding: 10px;
    }

    .layout__content-wrapper {
      padding: 20px;
      border-radius: 8px;
    }

    .menu-icon {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 480px) {
    .logo-text {
      font-size: 16px;
    }

    .logo-img {
      width: 32px;
      height: 32px;
    }

    .layout__content-wrapper {
      padding: 16px;
    }
  }
</style>
