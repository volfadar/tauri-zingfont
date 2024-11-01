import { zus } from '@/lib/utils'

type Data = {
  ip: string
  lastUpdateIp: number
  syncNotify: boolean
  colorPalette: { id: string; color: string }[]
}

type Expiry = {
  expiry: { name: keyof Data; date: number }[]
}
export const dataPersist = zus.withPersist<Data & Expiry>('dataPersist')({
  ip: '',
  lastUpdateIp: 0,
  syncNotify: false,
  colorPalette: [],
  expiry: [],
})
