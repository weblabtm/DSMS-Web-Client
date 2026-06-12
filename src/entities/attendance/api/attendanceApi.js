/**
 * @file attendanceApi.js
 * @layer LOGIC — Attendance domain API client
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║  - Use ONLY this.get/post/put/patch/delete for requests.                ║
 * ║  - Keep logic domain-specific. No UI, hooks, or JSX.                    ║
 * ║  - Export as a singleton instance.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { BaseApiClient } from '../../../shared/api/BaseApiClient.js';

class AttendanceApiClient extends BaseApiClient {
  constructor() {
    super('/attendance');
  }

  /**
   * List attendance records with optional query parameters.
   * @param {object} [params]
   * @returns {Promise<unknown>}
   */
  list(params) {
    return this.get('/', { params });
  }

  /**
   * Get attendance record by ID.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  getById(id) {
    return this.get(`/${id}`);
  }

  /**
   * Record new attendance.
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  create(data) {
    return this.post('/', data);
  }

  /**
   * Update attendance details (partial update).
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  update(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Remove an attendance record.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  remove(id) {
    return this.delete(`/${id}`);
  }
}

export const attendanceApi = new AttendanceApiClient();
