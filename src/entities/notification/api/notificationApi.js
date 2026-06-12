/**
 * @file notificationApi.js
 * @layer LOGIC — Notification domain API client
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║  - Use ONLY this.get/post/put/patch/delete for requests.                ║
 * ║  - Keep logic domain-specific. No UI, hooks, or JSX.                    ║
 * ║  - Export as a singleton instance.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { BaseApiClient } from '../../../shared/api/BaseApiClient.js';

class NotificationApiClient extends BaseApiClient {
  constructor() {
    super('/notifications');
  }

  /**
   * List notifications with optional query parameters.
   * @param {object} [params]
   * @returns {Promise<unknown>}
   */
  list(params) {
    return this.get('/', { params });
  }

  /**
   * Get notification by ID.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  getById(id) {
    return this.get(`/${id}`);
  }

  /**
   * Send or queue a new notification.
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  create(data) {
    return this.post('/', data);
  }

  /**
   * Update notification status/details (partial update).
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  update(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Dismiss or delete a notification record.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  remove(id) {
    return this.delete(`/${id}`);
  }
}

export const notificationApi = new NotificationApiClient();
