# entities/notification

Notification entity models and helpers.
Use for alert payloads, delivery metadata, and read/unread state.

## API Client

The domain API client for this entity is located at `api/notificationApi.js`. It extends [BaseApiClient](file:///c:/Users/sadee/Documents/weblabtm/sadeeshaweblabtm/DSMS-Web-Client/src/shared/api/BaseApiClient.js) and exports a singleton instance (`notificationApi`). All API calls relating to this domain should be made using this client.
