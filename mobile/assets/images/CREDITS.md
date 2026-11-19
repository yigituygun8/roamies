# Image credits

Photos in this folder come from [Unsplash](https://unsplash.com) and are used under the
[Unsplash License](https://unsplash.com/license) (free for commercial and non-commercial use,
attribution appreciated but not required). Each file is stored locally so the app does not depend
on a remote URL at runtime.

| File | Unsplash image id | Original source |
|---|---|---|
| `onboarding/plan.jpg` | `photo-1511632765486-a01980e01a18` | https://images.unsplash.com/photo-1511632765486-a01980e01a18 |
| `onboarding/swipe.jpg` | `photo-1523906834658-6e24ef2386f9` | https://images.unsplash.com/photo-1523906834658-6e24ef2386f9 |
| `onboarding/fair.jpg` | `photo-1476514525535-07fb3b4ae5f1` | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1 |
| `auth/welcome.jpg` | `photo-1499856871958-5b9627545d1a` | https://images.unsplash.com/photo-1499856871958-5b9627545d1a |

## How the four photo-hero files were prepared

1. Download the 900 x 1600 crop:
   `?w=900&h=1600&fit=crop&crop=faces|entropy&q=72&fm=jpg`
2. Bake the dark scrim into the pixels instead of drawing it at runtime, because a runtime gradient
   built from flat bands shows visible stripes on smooth skies. Blend each pixel towards the brand
   navy `#080C22` with alpha:

   - flat base: `0.08` over the whole photo
   - top ramp: `0.5 -> 0` over the first `22%` of the height (smoothstep), keeps the status bar and
     the Skip button readable
   - bottom ramp: `0 -> 0.9` from `40%` of the height down (from `30%` for `auth/welcome.jpg`),
     linear in the first case, so the headline and buttons always sit on dark pixels

3. Save as progressive JPEG, quality 76.

`PhotoHero` still draws a light scrim on top (max `0.35`). That is the safety net for screens where
the photo is cropped differently (tablets, landscape) and is weak enough to stay band-free.

## Other files

- `roamies-wordmark.png` is a trimmed copy of `roamies-logo.png` (transparent padding removed) so the
  wordmark can be placed at a predictable size.
- `loginBackground/loginHero.jpg` is a crop of `loginBackground/loginImage.jpg`: the illustration
  with the empty navy area below the group removed, so the login/register sheet starts right under
  the artwork.
