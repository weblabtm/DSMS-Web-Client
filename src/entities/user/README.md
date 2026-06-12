# entities/user

User entity models and helpers.
Use for profile data, identity fields, roles, and account-facing abstractions.

## API Client

The domain API client for this entity is located at `api/userApi.js`. It extends [BaseApiClient](file:///c:/Users/sadee/Documents/weblabtm/sadeeshaweblabtm/DSMS-Web-Client/src/shared/api/BaseApiClient.js) and exports a singleton instance (`userApi`). All API calls relating to this domain should be made using this client.
