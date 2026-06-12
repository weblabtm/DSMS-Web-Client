# entities/payment

Payment entity models and helpers.
Use for invoices, receipts, transactions, and payment status.

## API Client

The domain API client for this entity is located at `api/paymentApi.js`. It extends [BaseApiClient](file:///c:/Users/sadee/Documents/weblabtm/sadeeshaweblabtm/DSMS-Web-Client/src/shared/api/BaseApiClient.js) and exports a singleton instance (`paymentApi`). All API calls relating to this domain should be made using this client.
