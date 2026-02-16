import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './routes/home'
import Login from './routes/login'
import AdviceDetails from './routes/advice.details'
import MyPosts from './routes/my-posts'
import UserPosts from './routes/user-posts'
import './css/global.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/advice/:id',
    element: <AdviceDetails />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/user/me',
    element: <MyPosts />,
  },
  {
    path: '/user/:userId',
    element: <UserPosts />,
  },
])

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)