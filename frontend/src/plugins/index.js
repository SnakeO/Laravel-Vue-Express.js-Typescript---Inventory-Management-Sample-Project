/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import { createPinia } from 'pinia'
import router from '@/router'

const pinia = createPinia()
// Plugins
import vuetify from './vuetify'

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
}
