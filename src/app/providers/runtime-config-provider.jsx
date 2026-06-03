import { useEffect, useState } from 'react'

import { dsmsApi } from '../../shared/api/dsms-api.js'
import { createFallbackRuntimeConfig, loadRuntimeConfig, setGlobalRuntimeConfig } from '../../shared/config/runtime-config.js'
import { RuntimeConfigContext } from '../../shared/context/runtime-config-context.js'

const createInitialState = () => ({
    config: createFallbackRuntimeConfig(),
    error: null,
    status: 'loading',
})

export function RuntimeConfigProvider({ children }) {
    const [state, setState] = useState(createInitialState)

    const refresh = async () => {
        setState((current) => ({ ...current, status: 'loading', error: null }))

        try {
            const config = await loadRuntimeConfig()
            setGlobalRuntimeConfig(config)
            setState({ config, error: null, status: 'ready' })
        } catch (error) {
            const fallbackConfig = createFallbackRuntimeConfig()
            setGlobalRuntimeConfig(fallbackConfig)

            setState({
                config: fallbackConfig,
                error: error instanceof Error ? error.message : String(error),
                status: 'fallback',
            })
        }
    }

    useEffect(() => {
        let active = true

        const bootstrap = async () => {
            try {
                const config = await loadRuntimeConfig()

                if (active) {
                    setGlobalRuntimeConfig(config)
                    setState({ config, error: null, status: 'ready' })
                }
            } catch (error) {
                if (active) {
                    const fallbackConfig = createFallbackRuntimeConfig()
                    setGlobalRuntimeConfig(fallbackConfig)

                    setState({
                        config: fallbackConfig,
                        error: error instanceof Error ? error.message : String(error),
                        status: 'fallback',
                    })
                }
            }
        }

        bootstrap()

        return () => {
            active = false
        }
    }, [])

    return (
        <RuntimeConfigContext.Provider value={{ ...state, refresh, api: dsmsApi }}>
            {children}
        </RuntimeConfigContext.Provider>
    )
}
