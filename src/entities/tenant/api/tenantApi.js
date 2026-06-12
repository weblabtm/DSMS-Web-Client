/**
 * @file tenantApi.js
 * @layer LOGIC — Tenant domain API client
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║  - Use ONLY this.get/post/put/patch/delete for requests.                ║
 * ║  - Keep logic domain-specific. No UI, hooks, or JSX.                    ║
 * ║  - Export as a singleton instance.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { BaseApiClient } from '../../../shared/api/BaseApiClient.js';

class TenantApiClient extends BaseApiClient {
  constructor() {
    super('/tenant');
  }

  /**
   * List tenants. If accessToken is provided, forwards it as Authorization header.
   * Otherwise, requestJson will automatically inject token from saved session.
   * @param {string} [accessToken]
   * @returns {Promise<unknown>}
   */
  list(accessToken) {
    const options = {};
    if (accessToken) {
      options.headers = {
        Authorization: `Bearer ${accessToken}`,
      };
    }
    return this.get('/', options);
  }

  /**
   * Get a tenant's details by its unique URL slug.
   * @param {string} slug
   * @returns {Promise<unknown>}
   */
  getBySlug(slug) {
    return this.get(`/slug/${encodeURIComponent(slug)}`);
  }

  /**
   * Get tenant by ID.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  getById(id) {
    return this.get(`/${id}`);
  }

  /**
   * Create a new tenant record.
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  create(data) {
    return this.post('/', data);
  }

  /**
   * Update tenant details (partial update).
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<unknown>}
   */
  update(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Remove a tenant record.
   * @param {string|number} id
   * @returns {Promise<unknown>}
   */
  remove(id) {
    return this.delete(`/${id}`);
  }
}

export const tenantApi = new TenantApiClient();
