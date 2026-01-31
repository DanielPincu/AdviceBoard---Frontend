import type { Product } from '../interfaces/interface.product'

const API_URL = 'https://restapi-r7fj.onrender.com/api/products'

export async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(API_URL)
    return response.json()
}
  