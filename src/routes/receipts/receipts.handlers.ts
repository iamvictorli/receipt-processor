import type { RouteHandler } from '@hono/zod-openapi'

import { createReceipt, getReceipt } from '@/db/models/receipt'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import * as HttpStatusPhrases from '@/lib/http-status-phrases'

import type { GetPointsRoute, ProcessRoute } from './receipts.routes'
import type { GetPointsNotFound, GetPointsOk, ProcessOk } from './receipts.schemas'

import { getReceiptPoints } from './helpers'

export const process: RouteHandler<ProcessRoute> = (c) => {
  const receiptReq = c.req.valid('json')
  const id = createReceipt(receiptReq)

  return c.json({
    id,
  } satisfies ProcessOk, HttpStatusCodes.OK)
}

export const getPoints: RouteHandler<GetPointsRoute> = (c) => {
  const { id } = c.req.valid('param')

  const receipt = getReceipt(id)

  if (!receipt) {
    return c.json({
      error: {
        type: HttpStatusPhrases.NOT_FOUND,
        message: `No receipt found for id: ${id}`,
      },
    } satisfies GetPointsNotFound, HttpStatusCodes.NOT_FOUND)
  }

  const points = getReceiptPoints(receipt)
  return c.json({
    points,
  } satisfies GetPointsOk, HttpStatusCodes.OK)
}
