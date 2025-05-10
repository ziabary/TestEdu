import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faMessage, 
  faArrowRight, 
  faSpinner, 
  faPlus, 
  faChevronDown, 
  faChevronUp, 
  faXmark, 
  faBars, 
  faHistory,
  faMoon,
  faSun,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons'
import { useMockApi } from './mocks/mock-api'
import './mocks/mock-websocket'
import { createPinia } from 'pinia'

const app = createApp(App)

// Add Font Awesome icons
library.add(
  faMessage, 
  faArrowRight, 
  faSpinner, 
  faPlus, 
  faChevronDown, 
  faChevronUp, 
  faXmark,
  faBars,
  faHistory,
  faMoon,
  faSun,
  faUserCircle
)

// Create and use Pinia store
const pinia = createPinia()
app.use(pinia)

// Enable mocks in development
if (import.meta.env.DEV) {
  const mockApi = useMockApi()
  mockApi.isMockEnabled = true
}

app.use(router)
app.use(i18n)
app.use(ElementPlus)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
