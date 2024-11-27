import { z } from '@hono/zod-openapi'

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
