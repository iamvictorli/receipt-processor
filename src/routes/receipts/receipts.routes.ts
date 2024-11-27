import { createRoute, z } from '@hono/zod-openapi'

import * as HttpStatusCodes from '@/lib/http-status-codes'
import * as HttpStatusPhrases from '@/lib/http-status-phrases'

import { ReceiptSchema } from './receipts.schemas'

const tags = ['Receipts']

export const ProcessSchemas = {
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
      return z.object({
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
            details: ProcessSchemas.request.body.safeParse({}).error!.errors,
          },
        },
      })
    },
  },
}

export const process = createRoute({
  tags,
  method: 'post',
  path: '/process',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ProcessSchemas.request.body,
        },
      },
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'application/json': {
          schema: ProcessSchemas.responses[HttpStatusCodes.OK],
        },
      },
      description: 'Returns the ID assigned to the receipt',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: ProcessSchemas.responses[HttpStatusCodes.UNPROCESSABLE_ENTITY],
        },
      },
      description: 'The receipt is invalid',
    },
  },
  summary: 'Submits a receipt for processing',
  description: 'Submits a receipt for processing',
})

export const GetPointsSchemas = {
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
    get [HttpStatusCodes.UNPROCESSABLE_ENTITY]() {
      return z.object({
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
            details: GetPointsSchemas.request.params.safeParse(' ').error!.errors,
          },
        },
      })
    },
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
  },
}

export const getPoints = createRoute({
  tags,
  method: 'get',
  path: '/{id}/points',
  request: {
    params: GetPointsSchemas.request.params,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'application/json': {
          schema: GetPointsSchemas.responses[HttpStatusCodes.OK],
        },
      },
      description: 'The number of points awarded',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: {
        'application/json': {
          schema: GetPointsSchemas.responses[HttpStatusCodes.NOT_FOUND],
        },
      },
      description: 'No receipt found for that id',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: GetPointsSchemas.responses[HttpStatusCodes.UNPROCESSABLE_ENTITY],
        },
      },
      description: 'The ID of the receipt is invalid',
    },
  },
  summary: 'Returns the points awarded for the receipt',
  description: 'Returns the points awarded for the receipt',
})
