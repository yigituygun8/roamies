# Home screen — design plan

Status: implemented on `feature/home-screen-initial` with mock trip data. The
Supabase `trips` / `trip_members` / `votes` tables are not designed yet, so the
screen reads from `mobile/src/lib/trips.ts`.

Mockup: the reference frames were reviewed with the design side and removed from
the repo; the layout they described is captured below.

The mockup shows three 390 × 844 frames:

1. **Populated, light** — next-up hero, trip cards, create action
2. **Empty state, light** — first-run hero, create/join, three-step explanation
3. **Populated, dark** — the same layout with the dark theme tokens

The HTML source uses the existing photos in `mobile/assets/images`; open it in a
browser to adjust copy or spacing and re-export a screenshot.

## 1. What the home screen is for

Home is the first screen after login and the hub of the app. It should answer three
questions in this order:

1. **Where do I need to act right now?** (votes left, plan ready, invite waiting)
2. **How are my other trips doing?**
3. **How do I start or join a new trip?**

It is not a general travel feed and not an analytics dashboard. Everything on the
screen should help a group move from "we picked a city" to "we have a plan".

## 2. Navigation

| Tab | Contents | Why |
|---|---|---|
| **Trips** (default) | Next-up card, trip list, create/join | Trips are the core object of the product |
| **Activity** | Invites, "Mia finished voting", "Plan is ready" | Makes the group feel present and surfaces pending work |
| **+** (centre action) | Create a trip / join with a code | The most important action stays visible everywhere |
| **Chat** | Assistant entry point: ask about the trip, explain the plan | Reserves the navigation slot for the LLM assistant we are adding later |
| **Profile** | Account, friends, settings, sign out | Standard account surface |

The five slots are symmetric: **Trips · Activity · (+) · Chat · Profile**. The mint
`+` is the true centre of the bar, so the layout does not lean left or right, and
the assistant has a permanent home from day one.

`Explore` is intentionally not a tab. Place browsing already happens inside a trip
while swiping; a global explore feed would be a different product.

In v1 the Chat tab can open a simple assistant screen (or a friendly placeholder)
while the real conversation is wired to the LLM later. It is **not** a group chat
between members.

## 3. Information hierarchy (populated state)

```text
Header              greeting + avatar
Next up             one hero card for the trip that needs the user now
Your trips          compact cards for the rest
Create / join       one full-width action
Tab bar             Trips · Activity · (+) · Chat · Profile
```

Only **one** card competes for "do this now". Everything else is a list, not a
second call to action.

## 4. Screen states

| State | What the user sees |
|---|---|
| Populated | Hero "next up" card + trip cards + create action |
| Empty (new user) | Photo hero explaining the product, "Create a trip" and "Join with a code" |
| Loading | Skeleton cards in the same layout (no spinner-only screen) |
| Error / offline | Inline banner above the list with a retry action |
| Dark mode | Same layout, dark tokens, photos stay the same |

## 5. Components

| Component | Job | Content | States |
|---|---|---|---|
| `HomeHeader` | Orientation and identity | Date, greeting, avatar | Default |
| `NextUpCard` | The one action to take now | Cover photo, city, dates, member avatars, vote progress, status, primary CTA | Swipe, waiting, plan ready, set dates |
| `TripCard` | Scan the other trips | Thumbnail, city, dates, avatars, status | Voting, plan ready, past |
| `StatusChip` | Explain trip state | Text + dot/icon, mint or muted | Never colour-only |
| `AvatarStack` | Show the group | Up to 3 initials + `+N` | Overflow |
| `SectionHeader` | Separate sections | Title + optional "See all" | Default |
| `CreateTripCard` | Start a new trip | Plus icon + label + chevron | Default / pressed |
| `EmptyState` | Teach the product on first use | Photo, headline, 2 CTAs, 3-step strip | Default |
| `TabBar` | Navigation + primary action | 5 slots: Trips, Activity, centre mint `+`, Chat, Profile | Active / inactive / safe area |
| `Skeleton` | Loading feedback | Card-shaped placeholders | Loading |
| `InlineBanner` | Invites and errors | Icon, message, action | Info / error |

### Trip states

| Status | Copy | Primary action |
|---|---|---|
| No dates | "Pick your dates" | Set dates |
| Voting, user has places left | "3 places left to vote" | Swipe |
| Voting, user is done | "Waiting for the group" | View votes (secondary) |
| Building plan | "Building your plan" | None (spinner) |
| Plan ready | "Your plan is ready" | See route |
| Past | "Last trip" | View plan |

## 6. Visual direction

Keep the existing brand tokens; no new colour system or font is required.

- Background: `#e6f0ed` light / `#080C22` dark
- Surface: `#FFFFFF` light / `#161B29` dark
- Accent: mint `#09E2A1` for the primary button and the active tab only
- Text: `#161B29` / `#F0F0F0`; muted `#6B7280` / `#8E97B0`
- Cards: 24 px radius; buttons: pill (28 px); spacing on a 4/8/12/16/24 scale
- Photography: one large hero photo, compact thumbnails for the list. Every card
  full-bleed would slow scanning down.
- Fallback when a trip has no cover: city initial on a brand gradient.
- Motion: subtle card fade/stagger on load, `0.98` press scale, no parallax.

The photo-first language from onboarding and auth carries into home, but home is
more scannable: one emotional hero, then plain cards.

## 7. Accessibility

- Touch targets at least 44 × 44; tab bar respects the bottom safe area.
- Status is always text + icon, not colour alone.
- Avatars have accessible labels ("Osman, Mia, Jonas and 2 more").
- Primary CTA labels describe the result ("Swipe 3 places left", not "Continue").
- Contrast: mint is used as a fill with dark ink, not as small text on white.
- Respect reduced motion; no parallax or infinite animation.

## 8. Data the design assumes

These are design assumptions, not the API contract. Update `docs/PROJECT.md`
section 4 before implementing them.

- `trips`: id, city, country, start date, end date, cover image, status
- `trip_members`: display name, avatar/initials, vote finished flag
- Vote progress: how many members finished, how many places the current user has left
- Plan status: none / building / ready
- Invites: trip + inviter + code

## 9. Image sourcing — cities and places

Short answer: **map APIs do not provide the photos.** `react-native-maps` or
MapLibre with OpenStreetMap gives tiles, coordinates and geometry, not place
photography.

The contract already anticipates this: the `places` table has `image_url` and
`image_credit`, and `data/places.json` is the source of truth.

Recommended for v1:

1. Curate one photo per city and per place while building `data/places.json`.
   Use Unsplash or Wikimedia Commons and record the author/licence in
   `image_credit`.
2. Download the selected images once and store them in a public Supabase Storage
   bucket (or bundle the city covers in the app for the demo). Do not hotlink
   random URLs at runtime: rate limits, CORS, offline demos and changing URLs are
   all avoidable problems.
3. Keep `image_url` as the only field the app reads; render it with `expo-image`
   and its memory-disk cache.
4. Fallback: a city initial on a brand gradient when a photo is missing or fails.

Later options:

- **Google Places / Foursquare photos** have good coverage, but bring API keys,
  cost and caching/storing restrictions, and they couple the UI to a provider.
- **User uploads** make sense for user-added places, but need moderation and
  storage rules.
- **Wikimedia Commons** is free and attributable, but quality varies per place.

For the mockup, the photos are the existing Unsplash assets under
`mobile/assets/images`; they are placeholders, not the final seed data.

## 10. Out of scope for v1

- Global destination feed or "Explore"
- Map preview on home (belongs to the route/plan screen)
- Group chat or comments (the Chat tab is the AI assistant, not member chat)
- Prices, bookings, flights
- Dashboard statistics

## 11. Open questions

- Do we seed place photos from Unsplash or Wikimedia Commons, and who checks the
  credits before they go into `data/places.json`?
- Is Activity derived from votes/realtime, or a separate notifications table?
- Is "Join with a code" in v1, or only invite links?
- Are dates required when creating a trip, or can they be "TBD"?
- Does the empty state reuse one of the onboarding photos or get its own?

Settled while building the first version:

- **Join with a code:** the empty state's second CTA and the `/trips/join` route
  exist; the code form waits for the invites table.
- **Dates:** optional. A trip can sit in the `no-dates` state.
- **Empty state photo:** reuses `assets/images/onboarding/plan.jpg`.
- **Activity scope:** still open; the tab is a placeholder.

## 12. Next steps

1. ~~Review the mockup with the design-side teammate.~~ Done.
2. ~~Confirm the 5-slot tab set, the Activity scope and the Chat placeholder.~~
   Tab set and Chat placeholder confirmed; Activity scope is still open.
3. ~~Build `home.tsx` with mock data using the existing theme and components.~~
   Done in `app/(tabs)/home.tsx`.
4. Wire Supabase once the trips/members/votes tables are defined.

