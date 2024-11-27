import { createRoute } from '@hono/zod-openapi'

import * as HttpStatusCodes from '@/lib/http-status-codes'

import { GetPointsRouteSchema, ProcessRouteSchema } from './receipts.schemas'

const tags = ['Receipts']

export const process = createRoute({
  tags,
  method: 'post',
  path: '/process',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ProcessRouteSchema.request.body,
        },
      },
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'application/json': {
          schema: ProcessRouteSchema.responses[HttpStatusCodes.OK],
        },
      },
      description: 'Returns the ID assigned to the receipt',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: ProcessRouteSchema.responses[HttpStatusCodes.UNPROCESSABLE_ENTITY],
        },
      },
      description: 'The receipt is invalid',
    },
  },
  summary: 'Submits a receipt for processing',
  description: 'Submits a receipt for processing',
})

export const getPoints = createRoute({
  tags,
  method: 'get',
  path: '/{id}/points',
  request: {
    params: GetPointsRouteSchema.request.params,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'application/json': {
          schema: GetPointsRouteSchema.responses[HttpStatusCodes.OK],
        },
      },
      description: 'The number of points awarded',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: {
        'application/json': {
          schema: GetPointsRouteSchema.responses[HttpStatusCodes.NOT_FOUND],
        },
      },
      description: 'No receipt found for that id',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        'application/json': {
          schema: GetPointsRouteSchema.responses[HttpStatusCodes.UNPROCESSABLE_ENTITY],
        },
      },
      description: 'The ID of the receipt is invalid',
    },
  },
  summary: 'Returns the points awarded for the receipt',
  description: 'Returns the points awarded for the receipt',
})

export type ProcessRoute = typeof process
export type GetPointsRoute = typeof getPoints
