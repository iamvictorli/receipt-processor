import type { z } from '@hono/zod-openapi'

import crypto from 'node:crypto'

import { createApp } from '@/lib/create-app'
import * as HttpStatusCodes from '@/lib/http-status-codes'

import type { GetPointsSchemas, ProcessSchemas } from './receipts.routes'

import * as routes from './receipts.routes'

const router = createApp().openapi(
  routes.process,
  (c) => {
    const receipt = c.req.valid('json')

    const id = crypto.randomUUID()
    return c.json({
      id,
    } satisfies z.infer<typeof ProcessSchemas.responses[typeof HttpStatusCodes.OK]>, HttpStatusCodes.OK)
  },
).openapi(
  routes.getPoints,
  (c) => {
    return c.json({
      points: 123,
    } satisfies z.infer<typeof GetPointsSchemas.responses[typeof HttpStatusCodes.OK]>, HttpStatusCodes.OK)
  },
)

export default router
