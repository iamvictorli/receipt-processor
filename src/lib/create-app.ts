import type { Hook } from '@hono/zod-openapi'

import { OpenAPIHono } from '@hono/zod-openapi'

import { UNPROCESSABLE_ENTITY } from '@/lib/http-status-codes'
import notFound from '@/middleware/not-found'
import onError from '@/middleware/on-error'

export function createRouter() {
  const defaultHook: Hook<any, any, any, any> = (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: result.success,
          error: result.error,
        },
        UNPROCESSABLE_ENTITY,
      )
    }
  }

  return new OpenAPIHono({ strict: false, defaultHook })
}

export function createApp() {
  const app = createRouter()
  app.notFound(notFound)
  app.onError(onError)
  return app
}
