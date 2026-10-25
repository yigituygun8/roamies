"""Fairness-aware vote aggregation. Deterministic, no LLM.

Strategy: least misery, implemented as greedy maximin over member satisfaction.

- A member's satisfaction = (liked places that are in the plan) / (places they liked).
- Places are picked one at a time. Each step picks the place that gives the least
  happy member the highest satisfaction ("nobody is left out").
- Ties are broken by net approval (yes minus no), then by yes votes, then by fewer
  no votes, then alphabetically by place id, so the same votes always give the
  same plan.

For comparison we also compute the plain majority plan (most net approval) and the
satisfaction of its least happy member. This makes the fairness gain measurable.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Vote:
    user_id: str
    place_id: str
    liked: bool


@dataclass(frozen=True)
class Pick:
    place_id: str
    yes: tuple[str, ...]  # user ids who liked it (sorted)
    no_count: int
    in_majority_plan: bool
    helped: tuple[str, ...] = ()  # least happy members this pick helped (only for fairness picks)


@dataclass
class FairnessResult:
    picks: list[Pick]
    liked_count: dict[str, int]
    included_count: dict[str, int]
    min_satisfaction: float | None
    majority_place_ids: list[str] = field(default_factory=list)
    majority_min_satisfaction: float | None = None


def _tally(member_ids: list[str], votes: list[Vote]):
    members = set(member_ids)
    yes: dict[str, set[str]] = {}
    no: dict[str, set[str]] = {}
    for v in votes:
        if v.user_id not in members:
            continue
        (yes if v.liked else no).setdefault(v.place_id, set()).add(v.user_id)
        # a later vote for the same place replaces an earlier one
        (no if v.liked else yes).get(v.place_id, set()).discard(v.user_id)
    return yes, no


def satisfaction(liked: dict[str, set[str]], chosen: set[str]) -> dict[str, float]:
    """user -> share of their liked places that are chosen (only members who liked something)."""
    return {u: len(places & chosen) / len(places) for u, places in liked.items() if places}


def _min(values: dict[str, float]) -> float | None:
    return min(values.values()) if values else None


def select_places(member_ids: list[str], votes: list[Vote], k: int) -> FairnessResult:
    yes, no = _tally(member_ids, votes)
    candidates = sorted(p for p, users in yes.items() if users)
    liked: dict[str, set[str]] = {u: set() for u in member_ids}
    for p in candidates:
        for u in yes[p]:
            liked[u].add(p)

    def net(p: str) -> int:
        return len(yes.get(p, ())) - len(no.get(p, ()))

    k = max(0, min(k, len(candidates)))

    # Majority baseline: highest net approval.
    majority = sorted(candidates, key=lambda p: (-net(p), -len(yes[p]), len(no.get(p, ())), p))[:k]
    majority_set = set(majority)

    chosen: list[str] = []
    picks: list[Pick] = []
    remaining = list(candidates)
    while len(chosen) < k and remaining:
        current = satisfaction(liked, set(chosen))
        current_min = _min(current)

        def key(p: str):
            after = satisfaction(liked, set(chosen) | {p})
            return (-(_min(after) or 0.0), -net(p), -len(yes[p]), len(no.get(p, ())), p)

        best = min(remaining, key=key)
        after_min = _min(satisfaction(liked, set(chosen) | {best}))
        helped: tuple[str, ...] = ()
        if best not in majority_set and current_min is not None and after_min is not None and after_min > current_min:
            helped = tuple(sorted(u for u, s in current.items() if s == current_min and best in liked[u]))
        picks.append(Pick(best, tuple(sorted(yes[best])), len(no.get(best, ())), best in majority_set, helped))
        chosen.append(best)
        remaining.remove(best)

    chosen_set = set(chosen)
    return FairnessResult(
        picks=picks,
        liked_count={u: len(places) for u, places in liked.items()},
        included_count={u: len(places & chosen_set) for u, places in liked.items()},
        min_satisfaction=_min(satisfaction(liked, chosen_set)),
        majority_place_ids=majority,
        majority_min_satisfaction=_min(satisfaction(liked, majority_set)),
    )