# entities/tenant

Tenant entity models and helpers.
Use for organization metadata, subscription context, and tenancy boundaries.

## API Client

The domain API client for this entity is located at `api/tenantApi.js`. It extends [BaseApiClient](file:///c:/Users/sadee/Documents/weblabtm/sadeeshaweblabtm/DSMS-Web-Client/src/shared/api/BaseApiClient.js) and exports a singleton instance (`tenantApi`). All API calls relating to this domain should be made using this client.
