# shared/ui

Reusable UI primitives, base components, and layouts.

---

## Reusable Primitive Components

* **Button**: Premium styled button with outline, ghost, link, and default variants.
* **Badge**: Text badges for status labels.
* **Card**: Base visual layout block.
* **Carousel**: Multi-item slider.
* **Accordion** / **Tabs**: Base interactive elements.

---

## Global Buffer / Loader Overlay

The client implements a visually stunning, dark glassmorphic global loader (`GlobalLoader.jsx`) configured at the top layer of the application tree. Any component or service can toggle this global buffering indicator.

### How to use the Global Buffer

To show or hide the global loader, import `useUiStore` and use `showLoader` or `hideLoader`:

```javascript
import { useUiStore } from '../store/uiStore' // adjust path accordingly

function MyComponent() {
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  const handleAction = async () => {
    // 1. Show the global loader with a custom message
    showLoader('Updating database records...')

    try {
      await apiCall()
    } catch (err) {
      console.error(err)
    } finally {
      // 2. Always hide the loader in the finally block
      hideLoader()
    }
  }

  return (
    <button onClick={handleAction}>
      Run Action
    </button>
  )
}
```

### Best Practices

1. **Descriptive Text**: Always supply a concise description of the task (e.g. `"Syncing documents..."`, `"Generating report..."`) to keep users engaged and informed.
2. **Safe Toggling**: Always invoke `hideLoader()` inside the `finally` block or within a catch boundary to prevent the loader from freezing the screen on error.
3. **Double Redirection Coverage**: Use the global loader during async redirections to mask flashes of unstyled intermediate pages.

