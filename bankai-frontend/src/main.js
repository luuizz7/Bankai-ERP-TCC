import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
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
} from '@fortawesome/free-solid-svg-icons'

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

const app = createApp(App)

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')