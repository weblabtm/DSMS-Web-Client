/**
 * @file paymentApi.js
 * @layer LOGIC — Payment domain API client
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║  - Use ONLY this.get/post/put/patch/delete for requests.                ║
 * ║  - Keep logic domain-specific. No UI, hooks, or JSX.                    ║
 * ║  - Export as a singleton instance.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { BaseApiClient } from '../../../shared/api/BaseApiClient.js';

class PaymentApiClient extends BaseApiClient {
  constructor() {
    super('/payments');
  }

  /**
   * List payments with optional query parameters.
   * @param {object} [params]
   * @returns {Promise<unknown>}
   */
  list(params) {
    return this.get('/', { params });
  }

  /**
   * Get payment by ID.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  getById(id) {
    return this.get(`/${id}`);
  }

  /**
   * Record a new payment.
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  create(data) {
    return this.post('/', data);
  }

  /**
   * Update payment details (partial update).
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  update(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Cancel/Remove a payment record.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  remove(id) {
    return this.delete(`/${id}`);
  }
}

export const paymentApi = new PaymentApiClient();
