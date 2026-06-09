import { API_ENDPOINTS } from '../constants/api-endpoints.js'
import { requestJson } from './http-client.js'

export const dsmsApi = {
    getRuntimeConfig: () => requestJson(API_ENDPOINTS.runtimeConfig),
    getHealth: () => requestJson(API_ENDPOINTS.health),
    login: (payload) => requestJson(API_ENDPOINTS.authLogin, { method: 'POST', body: payload }),
    register: (payload) => requestJson(API_ENDPOINTS.authRegister, { method: 'POST', body: payload }),
    refresh: (payload) => requestJson(API_ENDPOINTS.authRefresh, { method: 'POST', body: payload }),
    logout: (payload) => requestJson(API_ENDPOINTS.authLogout, { method: 'POST', body: payload }),
    listTenants: (accessToken) => requestJson(API_ENDPOINTS.tenants, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
<<<<<<< HEAD
    }),
=======
    } : {}),
    getTenantBySlug: (slug) => requestJson(`/tenant/slug/${encodeURIComponent(slug)}`),
>>>>>>> 0627ddde93c286604c0b3e7d4543341c134ce5a2
}