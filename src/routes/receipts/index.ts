import { createRoute, z } from '@hono/zod-openapi'
import crypto from 'node:crypto'

import { createApp } from '@/lib/create-app'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import * as HttpStatusPhrases from '@/lib/http-status-phrases'

const tags = ['Receipts']

const ItemSchema = z.object({
  shortDescription: z.string().regex(/^[\w\s\-]+$/).openapi({
    description: 'The Short Product Description for the item.',
    example: 'Mountain Dew 12PK',
  }),
  price: z.string().regex(/^\d+\.\d{2}$/).openapi({
    description: 'The total price payed for this item.',
    example: '6.49',
  }),
}).openapi('Item')

const ReceiptSchema = z.object({
  retailer: z.string().regex(/^[\w\s\-&]+$/).openapi({
    description: 'The name of the retailer or store the receipt is from.',
    example: 'M&M Corner Market',
  }),
  purchaseDate: z.string().date().openapi({
    description: 'The date of the purchase printed on the receipt.',
    format: 'date', // using zod date should put format to date
    example: '2022-01-01',
  }),
  // regex on HH:MM 24 based time
  purchaseTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).openapi({
    description: 'The time of the purchase printed on the receipt. 24-hour time expected.',
    format: 'time', // using zod time should put time on openapi
    example: '13:01',
  }),
  items: z.array(ItemSchema).nonempty(),
  total: z.string().regex(/^\d+\.\d{2}$/).openapi({
    description: 'The total amount paid on the receipt.',
    example: '6.49',
  }),
}).openapi('Receipt')

const { error: ReceiptSchemaExampleError } = ReceiptSchema.safeParse(ReceiptSchema instanceof z.ZodArray ? [] : {})

const ProcessOkSchema = z.object({
  id: z.string().regex(/^\S+$/).openapi({
    example: 'adb6b560-0eef-42bc-9d16-df48f30e89b2',
  }),
})

const PointsParamsSchema = z.object({
  id: z.string().regex(/^\S+$/).openapi({
    param: {
      name: 'id',
      in: 'path',
      description: 'The ID of the receipt',
    },
  }),
})

const { error: PointsParamsExampleError } = PointsParamsSchema.safeParse({ id: ' ' })

const PointsOkSchema = z.object({
  points: z.number().int().openapi({
    description: 'Points awarded',
    example: 100,
  }),
})

const router = createApp().openapi(
  createRoute({
    tags,
    method: 'post',
    path: '/process',
    request: {
      body: {
        content: {
          'application/json': {
            schema: ReceiptSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: ProcessOkSchema,
          },
        },
        description: 'Returns the ID assigned to the receipt',
      },
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
        content: {
          'application/json': {
            schema: z.object({
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
            }).openapi({
              example: {
                error: {
                  type: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
                  details: ReceiptSchemaExampleError!.errors,
                },
              },
            }),
          },
        },
        description: 'The receipt is invalid',
      },
    },
    summary: 'Submits a receipt for processing',
    description: 'Submits a receipt for processing',
  }),
  (c) => {
    const receipt = c.req.valid('json')

    const id = crypto.randomUUID()
    return c.json({
      id,
    } satisfies z.infer<typeof ProcessOkSchema>, HttpStatusCodes.OK)
  },
).openapi(
  createRoute({
    tags,
    method: 'get',
    path: '/{id}/points',
    request: {
      params: PointsParamsSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: PointsOkSchema,
          },
        },
        description: 'The number of points awarded',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.object({
                type: z.literal(HttpStatusPhrases.NOT_FOUND),
                message: z.string(),
              }),
            }).openapi({
              example: {
                error: {
                  type: HttpStatusPhrases.NOT_FOUND,
                  message: 'No receipt found for id: 123abc',
                },
              },
            }),
          },
        },
        description: 'No receipt found for that id',
      },
      [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
        content: {
          'application/json': {
            schema: z.object({
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
            }).openapi({
              example: {
                error: {
                  type: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
                  details: PointsParamsExampleError!.errors,
                },
              },
            }),
          },
        },
        description: 'The ID of the receipt is invalid',
      },
    },
    summary: 'Returns the points awarded for the receipt',
    description: 'Returns the points awarded for the receipt',
  }),
  (c) => {
    return c.json({
      points: 123,
    } satisfies z.infer<typeof PointsOkSchema>, HttpStatusCodes.OK)
  },
)

export default router
