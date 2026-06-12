/**
 * @file batchApi.js
 * @layer LOGIC — Batch domain API client
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║  - Use ONLY this.get/post/put/patch/delete for requests.                ║
 * ║  - Keep logic domain-specific. No UI, hooks, or JSX.                    ║
 * ║  - Export as a singleton instance.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { BaseApiClient } from '../../../shared/api/BaseApiClient.js';

class BatchApiClient extends BaseApiClient {
  constructor() {
    super('/batches');
  }

  /**
   * List batches with optional query parameters.
   * @param {object} [params]
   * @returns {Promise<unknown>}
   */
  list(params) {
    return this.get('/', { params });
  }

  /**
   * Get batch by ID.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  getById(id) {
    return this.get(`/${id}`);
  }

  /**
   * Create a new batch record.
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  create(data) {
    return this.post('/', data);
  }

  /**
   * Update batch details (partial update).
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  update(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Remove a batch record.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  remove(id) {
    return this.delete(`/${id}`);
  }
}

export const batchApi = new BatchApiClient();
