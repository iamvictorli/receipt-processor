import { testClient } from 'hono/testing'
import { describe, expect, it } from 'vitest'

import type { UnprocessableEntityResponse } from '@/lib/http-schemas'

import * as HttpStatusCodes from '@/lib/http-status-codes'
import * as HttpStatusPhrases from '@/lib/http-status-phrases'

import type { GetPointsNotFound, GetPointsOk, ProcessOk, Receipt } from './receipts.schemas'

import app from './receipts.index'

describe('receipts app', () => {
  it ('submits a receipt and get the correct points', async () => {
    const client = testClient(app)
    const receipt: Receipt = {
      retailer: 'Target',
      purchaseDate: '2022-01-01',
      purchaseTime: '13:01',
      items: [
        {
          shortDescription: 'Mountain Dew 12PK',
          price: '6.49',
        },
        {
          shortDescription: 'Emils Cheese Pizza',
          price: '12.25',
        },
        {
          shortDescription: 'Knorr Creamy Chicken',
          price: '1.26',
        },
        {
          shortDescription: 'Doritos Nacho Cheese',
          price: '3.35',
        },
        {
          shortDescription: '   Klarbrunn 12-PK 12 FL OZ  ',
          price: '12.00',
        },
      ],
      total: '35.35',
    }
    const processReceiptRes = await client.process.$post({ json: receipt })
    expect(processReceiptRes.status).toBe(200)
    const { id } = await processReceiptRes.json() as ProcessOk

    const getPointsRes = await client[':id'].points.$get({ param: { id } })
    expect(getPointsRes.status).toBe(200)
    const getPointsJson = await getPointsRes.json() as GetPointsOk
    expect(getPointsJson).toStrictEqual({ points: 28 })

    const receipt1: Receipt = {
      retailer: 'M&M Corner Market',
      purchaseDate: '2022-03-20',
      purchaseTime: '14:33',
      items: [
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
      ],
      total: '9.00',
    }
    const processReceiptRes1 = await client.process.$post({ json: receipt1 })
    expect(processReceiptRes1.status).toBe(HttpStatusCodes.OK)
    const { id: id1 } = await processReceiptRes1.json() as ProcessOk

    const getPointsRes1 = await client[':id'].points.$get({ param: { id: id1 } })
    expect(getPointsRes1.status).toBe(HttpStatusCodes.OK)
    const getPointsJson1 = await getPointsRes1.json() as GetPointsOk
    expect(getPointsJson1).toStrictEqual({ points: 109 })
  })

  describe('post /process', () => {
    it(`${HttpStatusCodes.UNPROCESSABLE_ENTITY} ${HttpStatusPhrases.UNPROCESSABLE_ENTITY}`, async () => {
      const client = testClient(app)
      const res = await client.process.$post({
        // @ts-expect-error missing total
        json: {
          retailer: 'M&M Corner Market',
          purchaseDate: '2022-01-01',
          purchaseTime: '1:01',
          items: [
            {
              shortDescription: 'Mountain Dew 12PK',
              price: '6.49',
            },
          ],
        },
      })

      expect(res.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY)

      const json = await res.json() as UnprocessableEntityResponse

      expect(json.error.type).toBe(HttpStatusPhrases.UNPROCESSABLE_ENTITY)
      expect(json.error).toHaveProperty('details')
    })
  })
  describe ('get /:id/points', () => {
    it(`${HttpStatusCodes.NOT_FOUND} ${HttpStatusPhrases.NOT_FOUND}`, async () => {
      const client = testClient(app)
      const id = 'asdf'
      const res = await client[':id'].points.$get({
        param: {
          id, // id should not exist
        },
      })

      expect(res.status).toBe(HttpStatusCodes.NOT_FOUND)

      const json = await res.json() as GetPointsNotFound

      expect(json.error.type).toBe(HttpStatusPhrases.NOT_FOUND)
      expect(json.error.message).toBe(`No receipt found for id: ${id}`)
    })

    it(`${HttpStatusCodes.UNPROCESSABLE_ENTITY} ${HttpStatusPhrases.UNPROCESSABLE_ENTITY}`, async () => {
      const client = testClient(app)
      const unprocessableEntityResponse = await client[':id'].points.$get({
        param: {
          id: 'space space', // spaces should not work for ids
        },
      })

      expect(unprocessableEntityResponse.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY)

      const unprocessableEntityResponseJson = await unprocessableEntityResponse.json() as UnprocessableEntityResponse

      expect(unprocessableEntityResponseJson.error.type).toBe(HttpStatusPhrases.UNPROCESSABLE_ENTITY)
      expect(unprocessableEntityResponseJson.error).toHaveProperty('details')
    })
  })
})
