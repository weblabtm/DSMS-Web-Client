import { useContext } from 'react'

import { RuntimeConfigContext } from '../context/runtime-config-context.js'

export function useRuntimeConfig() {
    const context = useContext(RuntimeConfigContext)

    if (!context) {
        throw new Error('useRuntimeConfig must be used within RuntimeConfigProvider')
    }

    return context
}