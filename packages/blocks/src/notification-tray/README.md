## Core package baseline

Version 0.10.0 targets Veli React 0.20.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

A notification tray with a desktop popover and mobile bottom sheet. This experimental block is editable source. Applications supply notification data, translations, formatted dates, URLs and callbacks, and own fetching, filtering, pagination and read state.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and primitives. Wrap your application in `VeliProvider` with `language="en"` or `language="dv"` and your chosen color scheme. See the [provider guide](/docs/provider/) for direction and theme setup.

## Installation

Initialize Veli Blocks once per application, using the compatible Veli Web URL, then add the tray:

```sh
corepack pnpm dlx @veli-design/cli init
corepack pnpm dlx @veli-design/cli add notification-tray
```

The CLI reports required dependencies and incompatible installed versions. Import `NotificationTray` from the copied `notification-tray.tsx` and keep its source files together. Decorative icons use the declared `@phosphor-icons/react` dependency; no separate SVG files are required. Ensure Tailwind scans the copied directory, adding an `@source` path if needed. Commit the editable source and the `.veli/blocks/notification-tray/` baseline together.

## API

Supply `items` already filtered for the controlled `filter` (`all` or `unread`), and update them through `onFilterChange`. `unreadCount` is the total across all pages. The block does not change application data.

The default trigger displays a numeric unread badge when `unreadCount` is positive. It uses Veli Badge's standard `99+` display above 99, while the button's accessible name retains the full total. The visual count is hidden from assistive technology to avoid announcing it twice. A supplied `trigger` remains entirely application-owned.

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

Notifications are a list of links or static content. The tray provides keyboard focus management, Escape dismissal and focus restoration. The mobile surface uses the shared Veli Sheet for native swipe motion, settling, dismissal and scroll locking, with no block-specific gesture thresholds or animation durations. Close it with Escape, the close button, backdrop or supported native swipe. The existing title, options, close icon, 40×4px grabber and 85svh height are retained. Longer lists scroll beneath the header; reduced motion follows Sheet.

Supply translated labels, messages and timestamps for English/LTR and Dhivehi/RTL. Include status meaning in the message because icons are decorative. Loading, separate all/unread empty states, errors and pending updates have accessible text. Coordinate controlled overlays with your application shell and close them on navigation.

Validate your application's routes, translations, keyboard behavior, mobile gestures and mutation failures before adoption.

## Loading feedback

Initial loading uses local notification-shaped placeholders with one shared highlight across each row’s icon, message and timestamps. The highlight sweeps for 1500ms, then rests without shimmer for 500ms. It follows the text direction and uses Veli colour and easing tokens. The placeholders are decorative, and the tray announces the translated loading status once. Reduced motion shows static placeholders. Existing notifications stay visible during a refresh; retry states show their pending action instead of initial-loading placeholders.

Pending retry and paging actions use the shared `Spinner` button variant. The mark-all-read menu action uses `LoadingText`. These components support Veli themes and reduced motion; loading labels remain application-owned and translated through `labels`.

## Updating your copy

Version 0.10.0 requires `@veli-design/react@^0.20.0`, including the composable Sheet API. Upgrade the core dependency before adopting this block version. Existing notification props and host callbacks are unchanged; previous archives retain their original requirements.

Version 0.5.1 replaces the default unread dot with a numeric counter aligned to the header reference. Continue supplying the total unread count across all pages; the displayed count is capped at `99+`. Custom triggers are unchanged.

Version 0.3.0 requires `@veli-design/react@^0.16.0` for the shared loading components. Existing loading and mutation props control the indicators.

Version 0.2.0 uses `@phosphor-icons/react` for its icons. Add `@phosphor-icons/react@^2.1.10` as a direct dependency when upgrading the copied source. Review whether your application still needs its legacy icon dependency before removing it.

1. Run `veli status` and review the block changelog and dependency requirements.
2. Run `veli update notification-tray` to merge the new source with your local changes.
3. Resolve conflicts and run `veli update --continue notification-tray`, or use `--abort` to restore the previous copy.
4. Check your application and commit the updated source and baseline together.

Updating a Veli npm package does not update copied block source.
