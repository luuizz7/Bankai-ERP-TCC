// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // Nosso CSS global

/* 1. CONFIGURAÇÃO DO FONT AWESOME (Tudo junto agora) */

/* Importa o core e o componente Vue */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* Importa TODOS os ícones que você precisa de uma só vez */
import {
    // Ícones antigos que você já usava
    faHome,
    faBox,
    faUsers,
    faChartLine,
    faCog,
    // Ícones novos do menu do Olist
    faHouse,
    faDolly,
    faTags,
    faWallet,
    faBars,
    faCircleQuestion,
    faBell,
    // O ícone que faltava para "Cadastros"
    faPencilAlt
} from '@fortawesome/free-solid-svg-icons'

/* Adiciona TODOS os ícones à biblioteca de uma só vez */
library.add(
    faHome,
    faBox,
    faUsers,
    faChartLine,
    faCog,
    faHouse,
    faDolly,
    faTags,
    faWallet,
    faBars,
    faCircleQuestion,
    faBell,
    faPencilAlt
)


/* 2. CRIAÇÃO DA APLICAÇÃO VUE */
const app = createApp(App)

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon) // Registra o componente globalmente
app.mount('#app')