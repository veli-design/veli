## Ownership and setup

A notification tray with a desktop popover and mobile bottom sheet. Applications supply notification data, translated copy, formatted dates, URLs and callbacks. The block owns presentation and interaction only. It does not fetch, subscribe, store read state, interpret API payloads or inject HTML.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and `VeliProvider`, then install the editable source:

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add notification-tray
```

Run `init` once per application and supply your team's Veli Web URL. Package access uses the existing GitHub Packages configuration and catalog access uses WFA. The CLI reads this block's manifest, reports incompatible installed versions, and offers to install missing dependencies. Review any compatibility warning before adoption; `add` does not upgrade existing packages.

Import `NotificationTray` from the copied `notification-tray.tsx`. Keep both source files together. Styling uses Tailwind and Veli tokens, with no additional stylesheet. Ensure Tailwind scans the copied directory (`@source` if it is outside your app's normal source tree). Commit the editable source and the `.veli/blocks/notification-tray/` baseline together.

## Application boundary

Pass display items, controlled state and callbacks through a client adapter. Supply items **already filtered for the selected filter**, including when filtering happens on the server. `unreadCount` is the total from the app, not a count inferred from a loaded page. The app owns optimistic updates, rollback, pagination cursors and retry policy.

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

Each item has `id`, `content`, `timestamp` and `time`; optional fields are `dateTime`, `unread`, `intent` (`neutral`, `success`, `warning`, `danger`), `href`, `isPending` and `actions`. `content` accepts text or non-interactive React markup such as `<strong>` and `<bdi>`. Supply timestamps already formatted for the user's locale and timezone. Include status meaning in the message; icons are decorative. Put app-specific buttons in `actions`, which renders outside the row link. Use Veli Button's `isPending` for individual action mutations. Do not put interactive elements in `content` or pass unsanitized API HTML.

`NotificationTrayContent` accepts the same content props without the overlay props, plus optional `onClose` for a visible close button. Use it when the app shell already provides an accessible overlay. Name that dialog, constrain its height and retain focus management. Do not nest it inside a second dialog supplied by `NotificationTray`.

## States and accessibility

Rows are a semantic list of ordinary links or static content, not a menu or listbox. Only the options control is a menu. Veli Popover, Modal and Menu provide the [React Aria dialog behavior](https://react-aria.adobe.com/Modal/useDialog): dismissal, focus containment and focus restoration. The list scrolls independently of its header. Link text supplies a meaningful accessible name; unread and pending states also have text equivalents.

The tray opens as a popover on desktop and a bottom sheet on smaller screens. Notification text wraps, and longer lists scroll beneath the header. Dismiss the mobile sheet with its close button, by pressing the backdrop, or by dragging downward from the handle or non-interactive header area. Short or cancelled drags return it to its resting position. The close button also provides a keyboard/single-pointer alternative to dragging. Escape closes the innermost menu first. Both directions, both themes, reduced motion and long text are supported.

Unread indicators collapse toward the inline start when the app changes `unread` to false. The timestamp moves with them; reduced-motion users get the final state immediately. Adjacent separators disappear on hover or keyboard focus. The all and unread filters have separate empty messages, which you can override through `labels`. Loading never appears as an empty inbox. Initial errors show a danger icon, message and optional retry button. Refresh errors remain compact above retained rows. Errors are announced; pending mutations do not change app data or close the tray. A live status announces background work.

### Height and pending states

Desktop height follows content and is limited by the available viewport space. The mobile sheet keeps a consistent height, with the list filling the area below the handle and header. Empty, initial-loading and initial-error states reserve space for their content. When embedding `NotificationTrayContent`, constrain its height so the notification list can scroll independently.

“Mark all as read pending” means the app is saving a change to read state. Set `isMarkingAllRead` during that request: the action becomes disabled, its label changes and a live status announces the update. Update `items` and the total `unreadCount` on success, preserve or restore data on failure, and clear the flag when the request settles. This is separate from initial fetching (`isLoading`), paging (`loadMore.isLoading`) and a single row update (`item.isPending`). App-provided `actions` own their own pending/disabled state.

## Styling and layout

The tray uses Veli components, tokens and typography. Configure language and theme through your application's `VeliProvider`. Pass `className` to customize the content root's placement and sizing. `NotificationTrayContent` fills its parent, allowing an existing shell to provide its own layout and accessible overlay.

## Updating and adoption

Keep a notification adapter in your application's client layer. Map API events to display items and handle subscriptions, filtering, unread totals, pagination and mutation errors there. Keep notification data scoped to the signed-in account and clear it on account changes.

For client-side routing, use the router configured through your React Aria provider or pass a compatible link renderer through `renderLink`. The Next.js example demonstrates a NextLink renderer and local filtering of an already loaded list. For server filtering, pass the returned items directly.

Coordinate `isOpen` / `onOpenChange` with other overlays in your application shell. Close other overlays before opening the tray and close it on navigation. Keep the tray mounted outside a mobile menu that will unmount, and restore focus to a surviving control when opening from that menu. Alternatively, place `NotificationTrayContent` inside your own accessible overlay, retaining its focus management and dismissal behavior.

Use `veli status` and `veli update notification-tray` to review and merge later source releases. Updating a Veli npm package does not update copied block source. Test your adapter's routes, translations, subscription updates, mutation rollback and paging before adoption.
