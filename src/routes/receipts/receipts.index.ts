import { createApp } from '@/utils/create-app'

import * as handlers from './receipts.handlers'
import * as routes from './receipts.routes'

const app = createApp()
  .openapi(routes.process, handlers.process)
  .openapi(routes.getPoints, handlers.getPoints)

export default app
