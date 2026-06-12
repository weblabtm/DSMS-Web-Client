import { API_ENDPOINTS } from '../constants/api-endpoints.js'
import { requestJson } from './http-client.js'
import { studentApi } from '../../entities/student/api/studentApi.js'
import { instructorApi } from '../../entities/instructor/api/instructorApi.js'
import { batchApi } from '../../entities/batch/api/batchApi.js'
import { userApi } from '../../entities/user/api/userApi.js'
import { tenantApi } from '../../entities/tenant/api/tenantApi.js'
import { attendanceApi } from '../../entities/attendance/api/attendanceApi.js'
import { examApi } from '../../entities/exam/api/examApi.js'
import { paymentApi } from '../../entities/payment/api/paymentApi.js'
import { payrollApi } from '../../entities/payroll/api/payrollApi.js'
import { reportApi } from '../../entities/report/api/reportApi.js'
import { notificationApi } from '../../entities/notification/api/notificationApi.js'

export const dsmsApi = {
    getRuntimeConfig: () => requestJson(API_ENDPOINTS.runtimeConfig),
    getHealth: () => requestJson(API_ENDPOINTS.health),
    login: (payload) => requestJson(API_ENDPOINTS.authLogin, { method: 'POST', body: payload }),
    register: (payload) => requestJson(API_ENDPOINTS.authRegister, { method: 'POST', body: payload }),
    refresh: (payload) => requestJson(API_ENDPOINTS.authRefresh, { method: 'POST', body: payload }),
    logout: (payload) => requestJson(API_ENDPOINTS.authLogout, { method: 'POST', body: payload }),
    listTenants: (accessToken) => tenantApi.list(accessToken),
    getTenantBySlug: (slug) => tenantApi.getBySlug(slug),
}

export {
    studentApi,
    instructorApi,
    batchApi,
    userApi,
    tenantApi,
    attendanceApi,
    examApi,
    paymentApi,
    payrollApi,
    reportApi,
    notificationApi,
}