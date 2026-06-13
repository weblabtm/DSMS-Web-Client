# PWA Configuration Guide

## Overview
The DSMS Web Client has been configured as a Progressive Web App (PWA) with installable capabilities, offline support, and automatic service worker management.

## What Was Configured

### 1. Dependencies Installed
- `vite-plugin-pwa` - PWA plugin for Vite
- `workbox-window` - Service worker runtime library

### 2. Web Manifest
The application now has a web manifest with:
- **Name**: DSMS - Driving School Management System
- **Short Name**: DSMS
- **Description**: Premium multi-tenant SaaS workspace for driving academies
- **Theme Color**: #52b788 (matches app branding)
- **Background Color**: #041208 (dark theme)
- **Display Mode**: Standalone (app-like experience)
- **Orientation**: Portrait-primary
- **Icons**: Auto-generated from source SVG

### 3. Application Icons
- Created source SVG icon (`public/icon.svg`) with professional design
- PWA plugin automatically generates all required sizes (72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)
- Icons support both "any" and "maskable" purposes for adaptive icon support

### 4. Service Worker Configuration
- **Auto-Update Mode**: Service worker automatically checks for updates
- **Precaching**: Core assets (JS, CSS, HTML, images, fonts) are cached on install
- **Runtime Caching**: Google Fonts are cached for 1 year for offline performance
- **Cache Strategy**: CacheFirst for fonts, NetworkFirst for other assets

### 5. HTML Meta Tags
Added to `index.html`:
- `theme-color` meta tag for browser UI
- Apple mobile web app meta tags for iOS support
- Proper viewport configuration

### 6. Service Worker Registration
Integrated in `src/main.jsx`:
- Uses `virtual:pwa-register` module from vite-plugin-pwa
- Automatic update prompts when new content is available
- Offline readiness notification in console

## Testing PWA Installability

### Local Testing (Development)
```bash
npm run dev
```

### Production Testing
```bash
npm run build
npm run preview
```

### Browser Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit

### Install Prompt Testing
1. Open the application in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install and verify the app launches in standalone mode

### Offline Testing
1. Install the PWA
2. Disconnect from internet
3. Navigate through the app
4. Verify cached content loads without network

## PWA Criteria Met

✅ **Web App Manifest**: Configured with all required fields
✅ **Service Worker**: Registered and active with caching strategies
✅ **HTTPS**: Required for production (use Vercel/Netlify or enable HTTPS locally)
✅ **Icons**: Multiple sizes provided for different devices
✅ **Theme Color**: Configured for consistent branding
✅ **Display Mode**: Standalone for app-like experience
✅ **Start URL**: Configured to root path
✅ **Scope**: Set to root for full app access

## Customization Options

### Updating Icons
Replace `public/icon.svg` with your custom SVG. The plugin will auto-generate all sizes during build.

### Changing Theme Colors
Update in `vite.config.js`:
```javascript
theme_color: '#your-color',
background_color: '#your-bg-color',
```

And in `index.html`:
```html
<meta name="theme-color" content="#your-color">
```

### Adjusting Caching Strategy
Modify the `workbox` configuration in `vite.config.js` to add more runtime caching rules.

### Disabling Auto-Update
Change `registerType` in `vite.config.js` from `'autoUpdate'` to `'prompt'` for manual update control.

## Deployment Notes

- The PWA will work in production builds only
- Service worker requires HTTPS (or localhost for development)
- The manifest and service worker are generated during build in the `dist` folder
- No additional deployment configuration needed - standard static hosting works

## Troubleshooting

### Service Worker Not Registering
- Ensure you're running a production build or dev server
- Check browser console for errors
- Verify HTTPS is enabled (required for service workers)

### Install Prompt Not Showing
- Ensure the site is served over HTTPS
- Check that the user has visited the site at least twice
- Verify the manifest is correctly configured
- Use Lighthouse to check for PWA compliance issues

### Icons Not Displaying
- Verify `public/icon.svg` exists
- Rebuild the application: `npm run build`
- Check browser console for icon loading errors

## Next Steps

1. **Customize the icon**: Replace `public/icon.svg` with your brand icon
2. **Test thoroughly**: Run Lighthouse audit and test on multiple devices
3. **Deploy to production**: The PWA will be automatically enabled in production builds
4. **Monitor updates**: The service worker will automatically check for content updates

## Support

For issues or questions about PWA configuration, refer to:
- [vite-plugin-pwa documentation](https://vite-plugin-pwa.netlify.app/)
- [Web.dev PWA guide](https://web.dev/progressive-web-apps/)
- [MDN PWA documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
