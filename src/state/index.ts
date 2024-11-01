import { mapValuesKey } from 'zustand-x'
import { data } from './__data'
import { dataPersist } from './__data-persist'
import { search } from './__search'
import { selected } from './__selected'

// Global store
export const rootStore = { selected, data, dataPersist, search }

// Global hook selectors
export const useStore = () => mapValuesKey('use', rootStore)

// Global getter selectors
export const getX = mapValuesKey('get', rootStore)

// Global actions
export const setX = mapValuesKey('set', rootStore)
