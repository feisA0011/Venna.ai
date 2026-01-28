# Venna.ai

Trust-first AI receptionist for Danish hospitality venues.

## Getting started

```bash
pnpm install
pnpm dev
```

## Widget embed

```html
<script
  src="https://your-domain.com/widget/boot.js"
  data-venue-id="venue_123"
  data-api-base="https://your-domain.com"
></script>
<script>
  window.VennaWidget = window.VennaWidget || {};
  window.VennaWidget.init?.({ accent: "#fe1541", radius: 18 });
</script>
```

## Widget test

```bash
pnpm --filter @venna/widget widget-test
```

Then open http://localhost:4170.

## Scripts

- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm perf:budgets`
- `pnpm perf:lighthouse`
