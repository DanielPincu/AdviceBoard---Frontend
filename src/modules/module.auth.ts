import { api } from './module.interceptor' 

export async function login(email: string, password: string): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>('/user/login', { email, password })
  return data
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>('/user/register', { username, email, password })
  return data
}