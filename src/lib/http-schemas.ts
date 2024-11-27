import { z } from '@hono/zod-openapi'

import * as HttpStatusPhrases from '@/lib/http-status-phrases'

// for validation schemas
export const UnprocessableEntitySchema = z.object({
  error: z.object({
    type: z.literal(HttpStatusPhrases.UNPROCESSABLE_ENTITY),
    details: z.array(
      z.object({
        code: z.string(),
        path: z.array(
          z.union([z.string(), z.number()]),
        ),
        message: z.string(),
      }),
    ),
  }),
})

export type UnprocessableEntityResponse = z.infer<typeof UnprocessableEntitySchema>
