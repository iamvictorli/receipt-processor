import crypto from 'node:crypto'

// db should generate their own types, but for this example get the type from schemas
import type { Receipt } from '@/routes/receipts/receipts.schemas'

import db from '../index'

export function createReceipt(receipt: Receipt) {
  const id = crypto.randomUUID()
  db.receipts.set(id, receipt)
  return id
}

export function getReceipt(id: string) {
  return db.receipts.get(id)
}
