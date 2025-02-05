import './assets/main.css'
import Highcharts from 'highcharts'
import { createApp } from 'vue'
import HighchartsVue from 'highcharts-vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronRight,
  faChevronLeft,
  faMagnifyingGlass,
  faChevronDown,
  faMinus,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router/index.js'
import store from './store'

Highcharts.setOptions({
  lang: {
    thousandsSep: ',',
    decimalPoint: '.',
    locale: 'en',
  },
})
const app = createApp(App)

app.use(HighchartsVue)
app.use(store)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

library.add(faChevronRight, faChevronLeft, faMagnifyingGlass, faChevronDown, faMinus, faChevronUp)
