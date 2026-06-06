# Developer Guide: Frontend OTP & Multi-Factor Authentication (MFA)

This directory handles user authentication pages, including sign-in (`Login.jsx`), registration (`Register.jsx`), and the multi-factor verification screen (`Otp.jsx`).

---

## The MFA Transaction Flow (Pattern A)

To protect sensitive user accounts, the system enforces a strict, short-lived **MFA Transaction Token** flow. The frontend does not store passwords or tokens across redirect loops.

```
[Login Form] --(identifier/password)--> [POST /auth/login]
                                                 |
                                         (OTP is Required)
                                                 |
                                                 v
[Save Credentials to sessionStorage] <--- [400 + mfaToken]
                  |
         (Redirect to /otp)
                  |
                  v
[OTP Code Screen] --(Validate code + mfaToken)--> [POST /auth/otp/validate]
                                                          |
                                                      (Success)
                                                          |
                                                          v
[Redirect to /login?success=true] <---------------- [200 OK]
                  |
        (Mount & Auto-Login)
                  |
                  v
[Read sessionStorage & Login] ----(mfaToken)----> [POST /auth/login] ----(Success)----> [Dashboard]
```

---

## Implementation Details

### 1. Intercepting MFA Requirements
When a user attempts to log in and requires SMS verification, the backend returns a `400 Bad Request` with an `OTP required` status and a temporary `mfaToken`.

In your login controller:
```javascript
try {
  const session = await login({ identifier, password, rememberMe });
} catch (err) {
  const data = err.data || {};
  if (err.message === 'OTP required' || data.message === 'OTP required') {
    const { phoneNumber, mfaToken } = data;
    
    // Save login payload temporarily in sessionStorage (discarded on complete)
    sessionStorage.setItem('dsms_temp_login', JSON.stringify({ identifier, password, rememberMe, mfaToken }));
    
    // Redirect to verification screen passing transaction identifiers
    navigate(`/otp?phone=${encodeURIComponent(phoneNumber)}&email=${encodeURIComponent(identifier)}&mfaToken=${encodeURIComponent(mfaToken)}&callbackUrl=/login?success=true`, { replace: true });
  }
}
```

### 2. Validating the Code
The `/otp` page reads the query parameters and renders the verification UI. When the user enters the 6-digit code:
```javascript
import { validateOtp } from '../../shared/api/authApi.js';

// Inside OTP submission handler
await validateOtp({
  otp: otpCode,
  mfaToken: mfaTokenParam // Read from URL query params: searchParams.get('mfaToken')
});
```
*Note: Successful validation marks the `mfaToken` as **verified** in the server's cache (Redis) and redirects the browser to the specified `callbackUrl` (e.g. `/login?success=true`).*

### 3. Completing the Authentication
Upon returning to the login component with `success=true`, the component reads the temporarily saved credentials and performs an automated login retry, passing the verified `mfaToken`:

```javascript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    const stored = sessionStorage.getItem('dsms_temp_login');
    if (stored) {
      const { identifier, password, rememberMe, mfaToken } = JSON.parse(stored);
      sessionStorage.removeItem('dsms_temp_login'); // Immediately clear
      
      // Clean query params to ensure a clean history state
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Submit login with mfaToken
      login({ identifier, password, rememberMe, mfaToken })
        .then((session) => navigate('/dashboard'))
        .catch((err) => console.error("Auto-login failed:", err));
    }
  }
}, []);
```

---

## Security Best Practices
1. **Never persist tokens in LocalStorage**: Relational database storage/localstorage is subject to XSS theft. Use short-lived, transient browser memory state (`sessionStorage`) which is destroyed when the tab is closed.
2. **Immediate Cleanup**: Always invoke `sessionStorage.removeItem('dsms_temp_login')` immediately upon reading, whether the final login retry succeeds or fails.
3. **URL Sanitization**: Strip URL query strings (`?success=true`) using `replaceState` as soon as the auto-login mounts to prevent loops if the page is manually refreshed.
