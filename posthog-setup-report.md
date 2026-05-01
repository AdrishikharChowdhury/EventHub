<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your project. PostHog analytics has been added to the EventHub event management app. The integration initializes PostHog via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), sets up a reverse proxy through Next.js rewrites for better ad-blocker resistance, and captures key user engagement events in the two primary interactive components.

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | Fired when the user clicks the "Explore Events" button on the home page to scroll to the event listing | `components/ExploreBtn.tsx` |
| `event_card_clicked` | Fired when the user clicks on an event card, with properties: `event_title`, `event_slug`, `event_location`, `event_date` | `components/EventCard.tsx` |

### Files created / modified

- **`instrumentation-client.ts`** _(created)_ — initializes `posthog-js` client-side with reverse proxy, exception tracking, and debug mode in development.
- **`next.config.ts`** _(modified)_ — added `/ingest/*` rewrites routing PostHog traffic through the app, plus `skipTrailingSlashRedirect: true`.
- **`components/ExploreBtn.tsx`** _(modified)_ — added `posthog.capture('explore_events_clicked')` to the existing onClick handler.
- **`components/EventCard.tsx`** _(modified)_ — added `"use client"` directive and `posthog.capture('event_card_clicked')` with event metadata in an onClick handler on the Link.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/405718/dashboard/1533771
- **Insight — Explore Events button clicks over time**: https://us.posthog.com/project/405718/insights/yRX3eFDW
- **Insight — Event card clicks over time**: https://us.posthog.com/project/405718/insights/Ykp52Klr
- **Insight — Explore to Event Click Funnel** (conversion): https://us.posthog.com/project/405718/insights/EWtUlhGY
- **Insight — Most clicked events** (by event title): https://us.posthog.com/project/405718/insights/LNXQC6qL
- **Insight — Total event card clicks** (30-day count): https://us.posthog.com/project/405718/insights/nYaMSxKm

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
