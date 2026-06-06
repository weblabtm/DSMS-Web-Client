# DSMS Web Client

This app is the browser client for the DSMS backend.

## Client infrastructure

- Runtime config is loaded from `GET /config` so the app can read the active host and tenant-aware API base URL.
- Backend requests use a shared JSON HTTP helper in `src/shared/api/http-client.js`.
- Vite proxies backend routes during local development, so the client can call the server with relative paths.

## Local development

1. Copy `.env.example` to `.env` if you want to override the backend proxy target.
2. Run `npm install` once.
3. Run `npm run dev`.
4. If the backend is on another port, set `VITE_API_PROXY_TARGET=http://localhost:3000` or the correct target before starting Vite.
5. For local subdomain testing, open the app with `lvh.me`, for example `http://tenant1.lvh.me:5173` or `http://school-a.lvh.me:5173`.

- `GET /config`
- `GET /health`
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/otp/generate`
- `POST /auth/otp/validate`
- `GET /tenant`

## Developer Guides

- **OTP / Multi-Factor Authentication**: For details on the short-lived transaction token authentication flow, security considerations, and component logic, see the [Frontend OTP & MFA Guide](src/pages/auth/README.md).
