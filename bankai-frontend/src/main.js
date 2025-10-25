import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
    faHome, faBox, faUsers, faChartLine, faCog, faHouse,
    faDolly, faTags, faWallet, faBars, faCircleQuestion, faBell, faPencilAlt,
    faChevronLeft, faChevronRight, faTrashCan, 
    faFileInvoiceDollar, faBoxesStacked, faCashRegister, 
    faUsersGear, faCalendarAlt, faChartPie, faHeadset, faPuzzlePiece, 
    faLightbulb, faCloud, faShieldAlt, faRocket // Adicionados faShieldAlt e faRocket
} from '@fortawesome/free-solid-svg-icons'

library.add(
    faHome, faBox, faUsers, faChartLine, faCog, faHouse,
    faDolly, faTags, faWallet, faBars, faCircleQuestion, faBell, faPencilAlt,
    faChevronLeft, faChevronRight, faTrashCan,
    faFileInvoiceDollar, faBoxesStacked, faCashRegister, 
    faUsersGear, faCalendarAlt, faChartPie, faHeadset, faPuzzlePiece, 
    faLightbulb, faCloud, faShieldAlt, faRocket // Adicionados faShieldAlt e faRocket
)

const app = createApp(App)

app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon) 

app.mount('#app')