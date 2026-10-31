"""Choose places for a trip from the group's yes/no votes, fairly. Deterministic, no LLM.

Strategy: least misery. A member's satisfaction = (liked places in the plan) / (places they liked).
Places are added one at a time; each time we add the place that makes the LEAST happy member
as happy as possible, so nobody is left out.

The file has four small parts (read top to bottom):
1. VoteTable          - who said yes / no to each place.
2. Measuring          - how happy each member is with a plan.
3. Choosing           - the least misery loop, and the plain majority plan we compare against.
4. Result             - the chosen places, with who each one helped.
"""
from __future__ import annotations

from dataclasses import dataclass, field

# ---------------------------------------------------------------------------- 1. votes

@dataclass(frozen=True)
class Vote:
    user_id: str
    place_id: str
    liked: bool


class VoteTable:
    """The votes of trip members. A later vote on the same place replaces an earlier one."""

    def __init__(self, member_ids: list[str], votes: list[Vote]):
        self.members = list(member_ids)
        members = set(member_ids)

        latest: dict[tuple[str, str], bool] = {}  # (user, place) -> liked
        for vote in votes:
            if vote.user_id in members:  # votes from people outside the trip are ignored
                latest[(vote.user_id, vote.place_id)] = vote.liked

        self._yes: dict[str, set[str]] = {}  # place -> users who said yes
        self._no: dict[str, set[str]] = {}   # place -> users who said no
        for (user, place), liked in latest.items():
            voters = self._yes if liked else self._no
            voters.setdefault(place, set()).add(user)

    def candidates(self) -> list[str]:
        """Places at least one member liked, in alphabetical order."""
        return sorted(place for place, users in self._yes.items() if users)

    def likers(self, place: str) -> set[str]:
        return self._yes.get(place, set())

    def yes_count(self, place: str) -> int:
        return len(self._yes.get(place, ()))

    def no_count(self, place: str) -> int:
        return len(self._no.get(place, ()))

    def net(self, place: str) -> int:
        return self.yes_count(place) - self.no_count(place)

    def likes_of(self, user: str) -> set[str]:
        return {place for place, users in self._yes.items() if user in users}


# ---------------------------------------------------------------------------- 2. measuring

def satisfaction(table: VoteTable, plan: set[str]) -> dict[str, float]:
    """Member -> share of their liked places that are in the plan.
    Members who liked nothing are left out (nothing to satisfy)."""
    result = {}
    for user in table.members:
        liked = table.likes_of(user)
        if liked:
            result[user] = len(liked & plan) / len(liked)
    return result


def lowest_satisfaction(table: VoteTable, plan: set[str]) -> float | None:
    """Satisfaction of the least happy member, or None if nobody liked anything."""
    values = satisfaction(table, plan).values()
    return min(values) if values else None


# ---------------------------------------------------------------------------- 3. choosing

def least_misery_plan(table: VoteTable, k: int) -> list[str]:
    """Add places one at a time until the plan has k places (or nothing is left).
    Each step adds the best place according to _ranking."""
    plan: list[str] = []
    remaining = table.candidates()
    while len(plan) < k and remaining:
        best = max(remaining, key=lambda place: _ranking(table, set(plan), place))
        plan.append(best)
        remaining.remove(best)
    return plan


def _ranking(table: VoteTable, plan: set[str], place: str) -> tuple:
    """What max() compares, in order:
    1. how happy the least happy member would be with this place added (the least misery rule),
    2. then more net votes, 3. more yes votes, 4. fewer no votes.
    If everything is equal, max() keeps the first place in the list, and the list is alphabetical,
    so the same votes always give the same plan."""
    lowest = lowest_satisfaction(table, plan | {place}) or 0.0
    return (lowest, table.net(place), table.yes_count(place), -table.no_count(place))


def majority_plan(table: VoteTable, k: int) -> list[str]:
    """The plain majority plan (most net votes), only used to show how much fairer our plan is."""
    by_votes = sorted(table.candidates(),
                      key=lambda place: (table.net(place), table.yes_count(place), -table.no_count(place)),
                      reverse=True)  # sorted() keeps alphabetical order for equal places
    return by_votes[:k]


# ---------------------------------------------------------------------------- 4. result

@dataclass(frozen=True)
class Pick:
    place_id: str
    yes: tuple[str, ...]            # members who liked it (sorted)
    no_count: int
    in_majority_plan: bool          # would plain majority voting also pick it?
    helped: tuple[str, ...] = ()    # least happy members this pick lifted (for the reason text)


@dataclass
class FairnessResult:
    picks: list[Pick]
    liked_count: dict[str, int]       # member -> places they liked
    included_count: dict[str, int]    # member -> of those, places in the plan
    min_satisfaction: float | None    # least happy member with this plan
    majority_place_ids: list[str] = field(default_factory=list)
    majority_min_satisfaction: float | None = None  # least happy member with the majority plan


def select_places(member_ids: list[str], votes: list[Vote], k: int) -> FairnessResult:
    """Choose up to k places with least misery, and compare with the plain majority plan."""
    table = VoteTable(member_ids, votes)
    plan = least_misery_plan(table, k)
    majority = majority_plan(table, k)

    return FairnessResult(
        picks=_explain_picks(table, plan, set(majority)),
        liked_count={user: len(table.likes_of(user)) for user in table.members},
        included_count={user: len(table.likes_of(user) & set(plan)) for user in table.members},
        min_satisfaction=lowest_satisfaction(table, set(plan)),
        majority_place_ids=majority,
        majority_min_satisfaction=lowest_satisfaction(table, set(majority)),
    )


def _explain_picks(table: VoteTable, plan: list[str], majority_plan: set[str]) -> list[Pick]:
    """Turn the chosen place ids into Picks. A pick that majority voting would skip, and that lifts
    the least happy members, records who it helped ("Added so Cem also gets one of their picks")."""
    picks: list[Pick] = []
    so_far: set[str] = set()
    for place in plan:
        before = satisfaction(table, so_far)
        lowest_before = min(before.values()) if before else None
        lowest_after = lowest_satisfaction(table, so_far | {place})

        helped: tuple[str, ...] = ()
        lifted = lowest_before is not None and lowest_after is not None and lowest_after > lowest_before
        if place not in majority_plan and lifted:
            helped = tuple(sorted(
                user for user, value in before.items() if value == lowest_before and user in table.likers(place)
            ))

        picks.append(Pick(place, tuple(sorted(table.likers(place))), table.no_count(place),
                          place in majority_plan, helped))
        so_far.add(place)
    return picks