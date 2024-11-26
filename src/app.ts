import { apiReference } from '@scalar/hono-api-reference'

import { createApp } from '@/lib/create-app'
import index from '@/routes/index.route'

import packageJSON from '../package.json' with { type: 'json' }

const app = createApp()

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: packageJSON.version,
    title: 'Receipt Processor',
  },
})

// https://github.com/scalar/scalar/tree/main/packages/hono-api-reference
app.get('/reference', apiReference({
  theme: 'kepler',
  layout: 'classic',
  defaultHttpClient: {
    targetKey: 'javascript',
    clientKey: 'fetch',
  },
  spec: {
    url: '/doc',
  },
}))

const routes = [
  index,
] as const

routes.forEach((route) => {
  app.route('/', route)
})

export default app
