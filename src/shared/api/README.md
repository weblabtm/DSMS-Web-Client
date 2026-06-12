# shared/api

This directory contains the API client setup, HTTP transport layer, and core class-based patterns for DSMS backend communication.

## Directory Structure

```
src/shared/api/
├── BaseApiClient.js  # Abstract base class that all domain API modules extend
├── http-client.js    # Transport layer (Bearer token injection, tenant scoping, silent 401 refresh)
├── authApi.js        # pre-session authentication endpoints (HttpOnly cookie flows; does NOT extend BaseApiClient)
└── dsms-api.js       # Backwards-compatible hub that re-exports all domain client singletons
```

---

## Pattern Guidelines

To ensure secure, consistent, and maintainable requests:
1. **Never write raw `fetch()` calls** in UI or page components for authenticated endpoints.
2. **Never call `requestJson()` directly** in page components.
3. **Always extend [BaseApiClient](file:///c:/Users/sadee/Documents/weblabtm/sadeeshaweblabtm/DSMS-Web-Client/src/shared/api/BaseApiClient.js)** when adding domain-specific endpoints.

---

## Quick Start: Creating a Domain API Client

Create a file at `src/entities/<domain>/api/<domain>Api.js` with the following structure:

```javascript
/**
 * @file <domain>Api.js
 * @layer LOGIC
 */

import { BaseApiClient } from '../../../shared/api/BaseApiClient.js';

class DomainApiClient extends BaseApiClient {
  constructor() {
    super('/<domain-plural>'); // e.g. '/students' or '/batches' (no trailing slash)
  }

  list(params) {
    return this.get('/', { params });
  }

  getById(id) {
    return this.get(`/${id}`);
  }

  create(data) {
    return this.post('/', data);
  }

  update(id, data) {
    return this.patch(`/${id}`, data);
  }

  remove(id) {
    return this.delete(`/${id}`);
  }
}

// Export a singleton instance
export const domainApi = new DomainApiClient();
```

---

## Accessing APIs in UI Components

Always import and use the exported singleton instance:

```javascript
import { studentApi } from '@/entities/student/api/studentApi';

// Inside a React component or action handler:
const fetchStudents = async () => {
  try {
    const data = await studentApi.list();
    setStudents(data);
  } catch (error) {
    console.error('Failed to load students:', error.message);
  }
};
```
