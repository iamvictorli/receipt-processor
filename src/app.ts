import { apiReference } from '@scalar/hono-api-reference'

import { createApp } from '@/lib/create-app'
import notFound from '@/middleware/not-found'
import onError from '@/middleware/on-error'
import receiptsRoute from '@/routes/receipts/receipts.index'

import packageJSON from '../package.json' with { type: 'json' }

const app = createApp()

// add middlewares
app.notFound(notFound)
app.onError(onError)

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Receipt Processor',
    description: 'A simple receipt processor',
    version: packageJSON.version,
  },
})

// Adds Scalar API reference
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

// add all api routes
const _routes = app.route('/receipts', receiptsRoute)

export type AppType = typeof _routes
export default app
