import type { Item, Receipt } from './receipts.schemas'

function countAlphanumeric(str: string) {
  return str.replace(/[^a-z0-9]/gi, '').length
}

function isRoundDollarAmount(total: string) {
  return Number.parseFloat(total).toFixed(2).endsWith('.00')
}

function isMultipleOf25Cents(total: string): boolean {
  const cents = Math.round(Number.parseFloat(total) * 100)
  return cents % 25 === 0
}

function calculateItemPoints(items: Item[]) {
  let points = Math.floor(items.length / 2) * 5

  items.forEach((item) => {
    const trimmedLength = item.shortDescription.trim().length
    if (trimmedLength % 3 === 0) {
      points += Math.ceil(Number.parseFloat(item.price) * 0.2)
    }
  })

  return points
}

function isDayOdd(date: string) {
  return Number.parseInt(date.split('-')[2]!) % 2 === 1
}

function isTimeBetween2And4PM(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours === 14
    || hours === 15
    || (hours === 16 && minutes === 0)
}

// One point for every alphanumeric character in the retailer name.
// 50 points if the total is a round dollar amount with no cents.
// 25 points if the total is a multiple of 0.25.
// 5 points for every two items on the receipt.
// If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer.The result is the number of points earned.
// 6 points if the day in the purchase date is odd.
// 10 points if the time of purchase is after 2:00pm and before 4:00pm.
export function getReceiptPoints(receipt: Receipt) {
  let points = 0

  // Rule 1: Points for alphanumeric characters in retailer name
  points += countAlphanumeric(receipt.retailer)

  // Rule 2: 50 points for round dollar amount
  if (isRoundDollarAmount(receipt.total)) {
    points += 50
  }

  // Rule 3: 25 points for multiple of 0.25
  if (isMultipleOf25Cents(receipt.total)) {
    points += 25
  }

  // Rule 4 & 5: Points for items
  points += calculateItemPoints(receipt.items)

  // Rule 6: 6 points for odd day
  if (isDayOdd(receipt.purchaseDate)) {
    points += 6
  }

  // Rule 7: 10 points for purchase time between 2:00pm and 4:00pm
  if (isTimeBetween2And4PM(receipt.purchaseTime)) {
    points += 10
  }

  return points
}
