## Ownership and prerequisites

A notification tray with a desktop popover and mobile bottom sheet. This experimental block is editable source. Applications supply notification data, translations, formatted dates, URLs and callbacks, and own fetching, filtering, pagination and read state.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and primitives. Wrap your application in `VeliProvider` with `language="en"` or `language="dv"` and your chosen color scheme. See the [provider guide](/docs/provider/) for direction and theme setup.

## Installation

Initialize Veli Blocks once per application, using your team's Veli Web URL, then add the tray:

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add notification-tray
```

The CLI reports required dependencies and incompatible installed versions. Import `NotificationTray` from the copied `notification-tray.tsx` and keep its source files and `cursor-click.svg` together. Ensure Tailwind scans the copied directory, adding an `@source` path if needed. Commit the editable source and the `.veli/blocks/notification-tray/` baseline together.

## API

Supply `items` already filtered for the controlled `filter` (`all` or `unread`), and update them through `onFilterChange`. `unreadCount` is the total across all pages. The block does not change application data.

Each `NotificationItem` requires a stable `id`, `content`, `timestamp` and `time`. Optional fields are `dateTime`, `unread`, `intent` (`neutral`, `success`, `warning`, `danger`), `href`, `isPending` and `actions`. Format dates and resolve URLs in your application. Use text or non-interactive markup for `content`; place buttons in `actions` outside the row link.

| Props                                   | Use                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `onItemAction`                          | Receives the activated row ID; `href` handles navigation.                                               |
| `onMarkAllRead`, `isMarkingAllRead`     | Save read state and disable the action while saving. Update `items` and `unreadCount` when complete.    |
| `isLoading`                             | Show initial loading or refresh progress. Existing rows stay visible.                                   |
| `error`, `onRetry`                      | Show a translated error and optional retry action.                                                      |
| `loadMore`                              | Supply `{ onLoadMore, isLoading }` when another page is available; omit when exhausted.                 |
| `labels`                                | Translate visible and assistive copy. English defaults are exported as `notificationTrayLabels`.        |
| `renderLink`                            | Integrate a router link by forwarding all supplied props and the ref. Ordinary anchors work without it. |
| `isOpen`, `defaultOpen`, `onOpenChange` | Control the overlay or let it manage its own open state.                                                |
| `trigger`, `className`                  | Replace the bell with an accessible Veli/React Aria button or customize the content root.               |

Use `NotificationTrayContent` inside an application-owned overlay. It accepts the content props and optional `onClose`. Give its container an accessible name, height constraint, focus management and dismissal behavior.

## Accessibility and responsive behavior

Notifications are a list of links or static content. The tray provides keyboard focus management, Escape dismissal and focus restoration. On mobile, close it with the close button, backdrop or a downward drag from the handle or non-interactive header. Longer lists scroll beneath the header; reduced motion is supported.

Supply translated labels, messages and timestamps for English/LTR and Dhivehi/RTL. Include status meaning in the message because icons are decorative. Loading, separate all/unread empty states, errors and pending updates have accessible text. Coordinate controlled overlays with your application shell and close them on navigation.

Validate your application's routes, translations, keyboard behavior, mobile gestures and mutation failures before adoption.

## Updating your copy

1. Run `veli status` and review the block changelog and dependency requirements.
2. Run `veli update notification-tray` to merge the new source with your local changes.
3. Resolve conflicts and run `veli update --continue notification-tray`, or use `--abort` to restore the previous copy.
4. Check your application and commit the updated source and baseline together.

Updating a Veli npm package does not update copied block source.
