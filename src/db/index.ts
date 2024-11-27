import type { Receipt } from '@/routes/receipts/receipts.schemas'

// in memory db
const db = {
  receipts: new Map<string, Receipt>(),
}

export default db
