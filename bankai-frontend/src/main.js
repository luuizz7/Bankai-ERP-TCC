import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// REMOVIDO: Qualquer import relacionado a 'maska' or 'vue-imask' foi deletado.

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// ... seus imports do FontAwesome ...
import {
    faHome, faBox, faUsers, faChartLine, faCog, faHouse,
    faDolly, faTags, faWallet, faBars, faCircleQuestion, faBell, faPencilAlt
} from '@fortawesome/free-solid-svg-icons'

library.add(
    faHome, faBox, faUsers, faChartLine, faCog, faHouse,
    faDolly, faTags, faWallet, faBars, faCircleQuestion, faBell, faPencilAlt
)

const app = createApp(App)

app.use(router)

// REMOVIDO: A linha 'app.use(IMaskPlugin)' foi deletada.

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')