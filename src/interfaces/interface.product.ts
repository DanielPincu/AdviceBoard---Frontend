export interface Product {
  _id: string
  name: string
  description: string
  imageURL: string
  price: number
  stock: number
  isOnDiscount: boolean
  discountPct: number
  isHidden: boolean
}