# entities/exam

Exam entity models and helpers.
Use for test metadata, attempts, scores, and evaluation state.

## API Client

The domain API client for this entity is located at `api/examApi.js`. It extends [BaseApiClient](file:///c:/Users/sadee/Documents/weblabtm/sadeeshaweblabtm/DSMS-Web-Client/src/shared/api/BaseApiClient.js) and exports a singleton instance (`examApi`). All API calls relating to this domain should be made using this client.
