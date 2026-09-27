import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule } from '@nuxt/kit'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtModule({
  hooks: {
    'components:dirs'(dirs) {
      // Auto-register all Shadcn-vue components with "Ui" prefix
      // Usage: <UiButton>, <UiCard>, <UiInput>, <UiBadge>, etc.
      dirs.push({
        path: join(__dirname, 'components'),
        prefix: 'Ui',
        // Only the .vue files; each folder's index.ts barrel is not a component
        extensions: ['vue'],
        pathPrefix: false,
        global: true,
      })
    },
  },
})
