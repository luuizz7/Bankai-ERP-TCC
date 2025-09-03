// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // Nosso CSS global

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faHome, faBox, faUsers, faChartLine, faCog } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faHome, faBox, faUsers, faChartLine, faCog)

const app = createApp(App)

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon) // Registrar o componente globalmente
app.mount('#app')