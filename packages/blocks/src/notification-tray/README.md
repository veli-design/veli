## Ownership and setup

A notification tray with a desktop popover and mobile bottom sheet. Applications supply notification data, translated copy, formatted dates, URLs and callbacks. The block owns presentation and interaction only. It does not fetch, subscribe, store read state, interpret API payloads or inject HTML.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and `VeliProvider`, then install the editable source:

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add notification-tray
```

Run `init` once per application and supply your team's Veli Web URL. As with the footer, package access uses the existing GitHub Packages configuration and catalog access uses WFA. The CLI reads this block's manifest, reports incompatible installed versions, and offers to install missing dependencies. Review any compatibility warning before adoption; `add` does not upgrade existing packages.

Import `NotificationTray` from the copied `notification-tray.tsx`. Keep both source files together. Styling uses Tailwind and Veli tokens, with no additional stylesheet. Ensure Tailwind scans the copied directory (`@source` if it is outside your app's normal source tree). Commit the editable source and the `.veli/blocks/notification-tray/` baseline together.

## Application boundary

Pass display items, controlled state and callbacks through a client adapter, as with the footer's routing adapter. Supply items **already filtered for the selected filter**, including when filtering happens on the server. `unreadCount` is the total from the app, not a count inferred from a loaded page. The app owns optimistic updates, rollback, pagination cursors and retry policy.

Resolve destinations and presentation intent in the app. The block does not interpret API event types or copy HTML from a notification payload. Data passed across a server/client boundary must be serializable; callbacks and router renderers belong in the client adapter.

## API

| Prop                                    | Responsibility                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `items`                                 | Ordered `NotificationItem[]` for the current filter. Stable unique IDs preserve row identity.                               |
| `unreadCount`                           | Total unread count, including unloaded pages. Used by the bell badge and mark-all action.                                   |
| `filter`, `onFilterChange`              | Controlled `all` / `unread` selection. Update the data alongside the filter.                                                |
| `onItemAction`                          | Called with the ID when a row link is activated. Mark read in your adapter; the `href` handles navigation.                  |
| `onMarkAllRead`, `isMarkingAllRead`     | Optional mark-all action and its app-owned pending state. Disabled at zero unread or while pending.                         |
| `isLoading`                             | Initial loading or refreshing. Existing rows stay visible.                                                                  |
| `error`, `onRetry`                      | A translated error message and optional retry action. Existing rows stay visible on failure.                                |
| `loadMore`                              | Optional `{ onLoadMore, isLoading }`. Presence means another page is available for the current filter. Omit when exhausted. |
| `labels`                                | Partial override of the exported English `notificationTrayLabels`. Supply translations for all visible and assistive copy.  |
| `renderLink`                            | Veli Link's router renderer. Forward every supplied prop and ref. Anchors work without it.                                  |
| `isOpen`, `defaultOpen`, `onOpenChange` | Optional controlled or uncontrolled overlay state. Use controlled state for app-shell coordination.                         |
| `trigger`                               | Optional Veli/React Aria button element replacing the default bell. Supply its accessible name.                             |
| `className`                             | Classes on the content root for placement and sizing.                                                                       |

Each item has `id`, `content`, `timestamp` and `time`; optional fields are `dateTime`, `unread`, `intent` (`neutral`, `success`, `warning`, `danger`), `href`, `isPending` and `actions`. `content` accepts text or non-interactive React markup such as `<strong>` and `<bdi>`. Format timestamps in the app to avoid a date dependency, timers and server/client timezone mismatches. Include status meaning in the message; icons are decorative. Put app-specific buttons in `actions`, which renders outside the row link. Use Veli Button's `isPending` for individual action mutations. Do not put interactive elements in `content` or pass unsanitized API HTML.

`NotificationTrayContent` accepts the same content props without the overlay props, plus optional `onClose` for a visible close button. Use it when the app shell already provides an accessible overlay. Name that dialog, constrain its height and retain focus management. Do not nest it inside a second dialog supplied by `NotificationTray`.

## States and accessibility

Rows are a semantic list of ordinary links or static content, not a menu or listbox. Only the options control is a menu. Veli Popover, Modal and Menu provide the [React Aria dialog behavior](https://react-aria.adobe.com/Modal/useDialog): dismissal, focus containment and focus restoration. The list scrolls independently of its header. Link text supplies a meaningful accessible name; unread and pending states also have text equivalents.

The desktop surface keeps Figma's fixed 389px width in every state, with 32px radius, 16px padding, semantic colors and Veli typography. Row content grows rather than clipping to Figma's fixed text boxes. On screens up to 1024px, the tray becomes web2's 85svh bottom sheet with a drag handle, backdrop dismissal and an explicit close button. The close button also provides a keyboard/single-pointer alternative to dragging. Escape closes the innermost menu first. Both directions, both themes, reduced motion and long text are supported.

Unread indicators collapse toward the inline start when the app changes `unread` to false. The timestamp moves with them; reduced-motion users get the final state immediately. Adjacent separators disappear on hover or keyboard focus. Empty copy matches Figma, with separate wording for the unread filter. Its text uses the readable muted token instead of the inactive token. Loading never appears as an empty inbox. Errors are announced and retain loaded items; pending mutations do not change app data or close the tray. A live status announces background work.

### Height and pending states

Desktop height follows content, capped by React Aria's available viewport space; it is not a fixed-height or full-height panel. Mobile height is fixed at `85svh`, with the list filling the area below the handle and header. The embedded preview has a viewport-height cap. Empty and initial-loading bodies reserve `min-h-80` (320px with the default spacing) as a minimum, while notification rows grow with their text.

“Mark all as read pending” means the app is saving a change to read state. Set `isMarkingAllRead` during that request: the action becomes disabled, its label changes and a live status announces the update. Update `items` and the total `unreadCount` on success, preserve or restore data on failure, and clear the flag when the request settles. This is separate from initial fetching (`isLoading`), paging (`loadMore.isLoading`) and a single row update (`item.isPending`). App-provided `actions` own their own pending/disabled state.

All preview messages and references are fictional. The pending story is a deliberately frozen state; it does not send a request.

## Token and component audit

The block composes Veli Button, Badge, Link, Divider, Menu, Popover and Modal. Icons use Veli's existing `phosphor-react` dependency and spacing utilities; the row Link's `lg` size supplies the matching 20px icon treatment without an important override. Decorative row separators use the border token. Colors, typography, spacing, radii, shadows and transition timing use Veli tokens. Figma explicitly uses the brand tokens `warning-300` for warning icon backgrounds and `info-700` for unread dots.

| Concrete value             | Why it remains                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `389px`                    | Exact Figma desktop width; no matching Veli size token.                              |
| `1024px`                   | Mirrors Veli's `lg` breakpoint; `matchMedia` cannot use a CSS variable in its query. |
| `85svh`                    | web2 mobile sheet height; no Veli sheet-height token or sheet primitive.             |
| `12px` / `2px`             | Popover/menu offsets match spacing `3` / `0.5`; the APIs accept pixel numbers.       |
| `35%`, `40px`, `0.11px/ms` | Named web2 drag-dismiss thresholds; no Veli gesture tokens.                          |

Browser safe-area insets, inherited height and text wrapping are layout rules rather than design literals. All default copy is overridable through `labels`; messages, times and URLs are app-owned. The embedded preview uses a fixed 389px wrapper that can shrink inside a narrow canvas. `NotificationTrayContent` itself fills its parent so an existing shell can own its layout.

## Updating and adoption

### gov.mv integration

The reviewed [govmv-web snapshot](https://github.com/tradenetcorp/govmv-web/tree/e8a7dadd719ac60a05ced1a32f6215aae94404c4) already uses Next.js 16, React 19, Tailwind 4 and Phosphor. It pins Veli UI `0.11.0`, while this block was tested with UI `0.13.0` and tokens `0.7.1`; verify that upgrade against the existing shell. Its `src/components/veli-provider.tsx` already supplies both VeliProvider and React Aria RouterProvider, so ordinary Veli row links can use that router without `renderLink` or another provider. The standalone Next.js example also demonstrates a NextLink renderer for apps that prefer it.

Keep a notification adapter in gov.mv's client layer. It maps API events to this block's display items and handles subscriptions, selected-filter queries, total unread counts, pagination and mutation errors. Resolve URLs and safe text there; do not copy web2's raw HTML rendering into the block. Keep query data scoped to the signed-in account and clear it on account changes. The local-filter example below is for an already loaded list; server filtering should pass the returned items directly.

In `src/components/site/site-shell.tsx`, coordinate `isOpen` / `onOpenChange` with the existing menu and account panel. Include notifications in the shell's open-overlay state so scrolling cannot hide its trigger. Close other overlays before opening it and close it on navigation. Keep the tray mounted outside a mobile menu that will unmount, and explicitly restore focus to a surviving control when opening from that menu. Alternatively, place `NotificationTrayContent` inside gov.mv's own accessible overlay, retaining its focus, height, stacking and dismissal behavior.

The consumer fixture checks both NextLink rendering and the React Aria RouterProvider path. It does not replace signed-in gov.mv testing of delivery, account switching, translations, URL resolution and interactions between shell overlays.

The new block is not published while this work remains on a local branch. For a local integration trial, copy both manifest source files together and install the listed dependencies. After release, use the CLI installation command above.

Use `veli status` and `veli update notification-tray` to review and merge later source releases. Updating an npm primitive does not update copied block logic. Test your adapter's routes, translation, subscription updates, mutation rollback and paging before adoption. Browser automation does not replace manual assistive-technology or real-device review.
