import { useEffect, useState } from 'react'
import type { Product } from '../interfaces/interface.product'
import { fetchProducts } from '../modules/module.product'
import Nav from '../components/nav'


export default function Home() {
  
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
  }, [])

  return (
    <div className="mx-4">
     
      <h1 className="mx-4 text-2xl font-bold">
        Home Page
      </h1>

      <Nav />
      
      {products.length > 0 && (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <img
                src={product.imageURL}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />

              <h2 className="mt-3 text-lg font-semibold">
                {product.name}
              </h2>

              <p className="text-sm text-gray-600">
                {product.description}
              </p>

             
              <div className="text-sm text-gray-500">
                Stock: {product.stock}
              </div>

              
            </div>
          ))}
        </div>
      )}
    </div>
  )
}