import type { Hook } from '@hono/zod-openapi'

import { OpenAPIHono } from '@hono/zod-openapi'

import * as HttpStatusCodes from '@/lib/http-status-codes'
import * as HttpStatusPhrases from '@/lib/http-status-phrases'

export function createApp() {
  const defaultHook: Hook<any, any, any, any> = (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            type: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
            details: result.error.errors,
          },
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
      )
    }
  }

  return new OpenAPIHono({ strict: false, defaultHook })
}
