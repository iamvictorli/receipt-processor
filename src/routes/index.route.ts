import { createRoute, z } from '@hono/zod-openapi'

import { createRouter } from '@/lib/create-app'
import { OK } from '@/lib/http-status-codes'

const router = createRouter().openapi(
  createRoute({
    tags: ['Index'],
    method: 'get',
    path: '/',
    responses: {
      [OK]: {
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: 'Tasks API Index',
      },
    },
  }),
  (c) => {
    return c.json({
      message: 'Tasks API',
    })
  },
)

export default router
