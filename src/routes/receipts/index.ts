import { createRoute, z } from '@hono/zod-openapi'

import { createApp } from '@/lib/create-app'
import { BAD_REQUEST, OK } from '@/lib/http-status-codes'

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
      [OK]: {
        content: {
          'application/json': {
            schema: z.object({
              id: z.string().regex(/^\S+$/).openapi({
                example: 'adb6b560-0eef-42bc-9d16-df48f30e89b2',
              }),
            }),
          },
        },
        description: 'Returns the ID assigned to the receipt',
      },
      [BAD_REQUEST]: {
        description: 'The receipt is invalid',
      },
    },
    summary: 'Submits a receipt for processing',
    description: 'Submits a receipt for processing',
  }),
  (c) => {
    return c.json({
      id: 'Tasks API',
    })
  },
).openapi(
  createRoute({
    tags,
    method: 'get',
    path: '/{id}/points',
    request: {
      params: z.object({
        id: z.string().regex(/^\S+$/).openapi({
          param: {
            name: 'id',
            in: 'path',
            description: 'The ID of the receipt',
          },
        }),
      }),
    },
    responses: {
      [OK]: {
        content: {
          'application/json': {
            schema: z.object({
              points: z.number().int().openapi({
                description: 'Points awarded',
                example: 100,
              }),
            }),
          },
        },
        description: 'The number of points awarded',
      },
      [BAD_REQUEST]: {
        description: 'No receipt found for that id',
      },
    },
    summary: 'Returns the points awarded for the receipt',
    description: 'Returns the points awarded for the receipt',
  }),
  (c) => {
    return c.json({
      points: 123,
    })
  },
)

export default router
