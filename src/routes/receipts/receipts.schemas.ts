import { z } from '@hono/zod-openapi'

import { UnprocessableEntitySchema } from '@/lib/http-schemas'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import * as HttpStatusPhrases from '@/lib/http-status-phrases'

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

export type Item = z.infer<typeof ItemSchema>

export const ReceiptSchema = z.object({
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

export type Receipt = z.infer<typeof ReceiptSchema>

export const ProcessRouteSchema = {
  request: {
    body: ReceiptSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: z.object({
      id: z.string().regex(/^\S+$/).openapi({
        example: 'adb6b560-0eef-42bc-9d16-df48f30e89b2',
      }),
    }),
    get [HttpStatusCodes.UNPROCESSABLE_ENTITY]() {
      return UnprocessableEntitySchema.openapi({
        example: {
          error: {
            type: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
            details: ProcessRouteSchema.request.body.safeParse({}).error!.errors,
          },
        },
      })
    },
  },
}

export type ProcessOk = z.infer<typeof ProcessRouteSchema.responses[typeof HttpStatusCodes.OK]>

export const GetPointsRouteSchema = {
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
    [HttpStatusCodes.OK]: z.object({
      points: z.number().int().openapi({
        description: 'Points awarded',
        example: 100,
      }),
    }),
    [HttpStatusCodes.NOT_FOUND]: z.object({
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
    get [HttpStatusCodes.UNPROCESSABLE_ENTITY]() {
      return UnprocessableEntitySchema.openapi({
        example: {
          error: {
            type: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
            details: GetPointsRouteSchema.request.params.safeParse(' ').error!.errors,
          },
        },
      })
    },
  },
}

export type GetPointsOk = z.infer<typeof GetPointsRouteSchema.responses[typeof HttpStatusCodes.OK]>
export type GetPointsNotFound = z.infer<typeof GetPointsRouteSchema.responses[typeof HttpStatusCodes.NOT_FOUND]>
