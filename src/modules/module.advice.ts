import axios from 'axios'
import type { Advice } from '../interfaces/interface.advice'

const API_ROOT = 'http://localhost:4000/api'

const api = axios.create({
    baseURL: API_ROOT,
    headers: {
        'Content-Type': 'application/json',
    },
})

export async function fetchAllAdvices(): Promise<Advice[]> {
    const { data } = await api.get<Advice[]>('/advices')
    return data
}

export async function fetchAdviceById(id: string): Promise<Advice> {
    const { data } = await api.get<Advice>(`/advice/${id}`)
    return data
}

export async function updateAdviceById(
    id: string,
    payload: Partial<Advice>
): Promise<Advice> {
    const { data } = await api.put<Advice>(`/advice/${id}`, payload)
    return data
}

export async function deleteAdviceById(id: string): Promise<void> {
    await api.delete(`/advice/${id}`)
}

export async function createAdvice(
    payload: Pick<Advice, 'title' | 'content' | 'anonymous'>
): Promise<Advice> {
    const { data } = await api.post<Advice>('/advice', {
        ...payload,
        _createdBy: '64f9c2a4b1e3a2c9d8f12345',
    })
    return data
}