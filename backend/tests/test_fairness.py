import pytest

from app.services.fairness import Vote, select_places


def votes(table: dict[str, dict[str, bool]]) -> list[Vote]:
    return [Vote(u, p, liked) for u, row in table.items() for p, liked in row.items()]


# 1. Museum vs market: the minority friend gets a place that majority voting would skip
def test_1_minority_member_gets_a_pick_that_majority_voting_would_skip():
    # Two museum fans, one food fan. Majority voting would choose only museums.
    v = votes({
        "ana": {"museum-a": True, "museum-b": True, "market": False},
        "ben": {"museum-a": True, "museum-b": True, "market": False},
        "cem": {"museum-a": False, "museum-b": False, "market": True},
    })
    r = select_places(["ana", "ben", "cem"], v, k=2)
    chosen = [p.place_id for p in r.picks]
    assert "market" in chosen
    assert r.included_count["cem"] == 1
    assert r.min_satisfaction > r.majority_min_satisfaction
    assert r.majority_min_satisfaction == 0
    market = next(p for p in r.picks if p.place_id == "market")
    assert market.helped == ("cem",) and not market.in_majority_plan


# 2. Same votes, same plan every time
def test_2_result_is_deterministic():
    v = votes({"a": {"x": True, "y": True, "z": True}, "b": {"x": True, "y": True, "z": True}})
    first = [p.place_id for p in select_places(["a", "b"], v, k=2).picks]
    for _ in range(5):
        assert [p.place_id for p in select_places(["a", "b"], v, k=2).picks] == first
    assert first == ["x", "y"]  # full tie -> alphabetical


# 3. Only one place is liked; Ben says no to everything
def test_3_only_liked_places_are_chosen():
    v = votes({"ana": {"x": True}, "ben": {"x": False, "y": False}})
    r = select_places(["ana", "ben"], v, k=10)
    assert [p.place_id for p in r.picks] == ["x"]
    assert r.included_count == {"ana": 1, "ben": 0}
    assert r.min_satisfaction == 1.0  # Ben liked nothing, so he is not counted; Ana is at 100%


# 4. Friends disagree about one place (Ben dislikes the market that Ana and Cem like)
def test_4_friends_who_disagree_about_one_place():
    v = votes({
        "ana": {"museum": True, "market": True},
        "ben": {"museum": True, "market": False},
        "cem": {"market": True, "park": True},
    })
    r = select_places(["ana", "ben", "cem"], v, k=2)
    assert [p.place_id for p in r.picks] == ["museum", "market"]
    assert r.included_count == {"ana": 2, "ben": 1, "cem": 1}
    assert r.min_satisfaction == pytest.approx(0.5)  # Cem: 1 of 2


# 5. Popular places win once everyone is covered
def test_5_popular_places_win_once_everyone_is_covered():
    v = votes({
        "ana": {"p1": True, "p2": True, "p3": True},
        "ben": {"p1": True, "p2": True, "p3": False},
    })
    r = select_places(["ana", "ben"], v, k=2)
    assert [p.place_id for p in r.picks] == ["p1", "p2"]
    assert r.min_satisfaction == pytest.approx(2 / 3)


# 6. Heavy liker vs light liker: least misery balances percentages, not place counts
def test_6_least_misery_balances_percentages_not_place_counts():
    # Ana likes 2 places, Ben likes 6. Both end at 50%, so Ben gets more places.
    v = votes({
        "ana": {"albertina": True, "belvedere": True, "prater": False},
        "ben": {"albertina": False, "belvedere": False, "prater": True, "riesenrad": True,
                "donauturm": True, "kahlenberg": True, "naschmarkt": True, "stephansdom": True},
    })
    r = select_places(["ana", "ben"], v, k=4)
    assert r.included_count == {"ana": 1, "ben": 3}
    assert r.min_satisfaction == 0.5


# 7. Realistic: four friends end at 100%, 100%, 40% and 35%
def test_7_four_friends_realistic_spread():
    ana_likes = [f"p{i}" for i in [10, 12, 13, 16, 17, 18, 19, 2, 20, 22, 23, 24, 26, 28, 3, 4, 5, 7, 8, 9]]
    v = votes({
        "Ana": {p: True for p in ana_likes},
        "Ben": {"p14": True, "p6": True},
        "Cem": {"p26": True, "p7": True, "p8": True},
        "Dan": {"p0": True, "p15": True, "p18": True, "p20": True, "p25": True},
    })
    r = select_places(["Ana", "Ben", "Cem", "Dan"], v, k=9)
    assert r.liked_count == {"Ana": 20, "Ben": 2, "Cem": 3, "Dan": 5}
    assert r.included_count == {"Ana": 7, "Ben": 2, "Cem": 3, "Dan": 2}
    assert r.min_satisfaction == pytest.approx(7 / 20)  # Ana, 35%
    assert r.majority_min_satisfaction == 0


# 8. Everyone has the same taste
def test_8_everyone_has_the_same_taste():
    v = votes({u: {"x": True, "y": True, "z": True} for u in "abcd"})
    r = select_places(list("abcd"), v, k=2)
    assert [p.place_id for p in r.picks] == ["x", "y"]
    assert r.min_satisfaction == pytest.approx(2 / 3)
    assert all(not p.helped for p in r.picks)  # nobody needed help


# 9. Two museum fans, one park fan, one food fan
def test_9_two_minorities_both_get_a_place():
    v = votes({
        "ana": {"m1": True, "m2": True},
        "ben": {"m1": True, "m2": True},
        "cem": {"park": True},
        "dan": {"food": True},
    })
    r = select_places(["ana", "ben", "cem", "dan"], v, k=3)
    assert [p.place_id for p in r.picks] == ["m1", "food", "park"]
    assert r.included_count == {"ana": 1, "ben": 1, "cem": 1, "dan": 1}
    assert r.min_satisfaction == pytest.approx(0.5)


# 10. Four friends, four different favourites, room for two
def test_10_four_different_favourites_with_room_for_two():
    v = votes({"a": {"pa": True}, "b": {"pb": True}, "c": {"pc": True}, "d": {"pd": True}})
    r = select_places(list("abcd"), v, k=2)
    assert [p.place_id for p in r.picks] == ["pa", "pb"]
    assert r.included_count == {"a": 1, "b": 1, "c": 0, "d": 0}
    assert r.min_satisfaction == 0.0


# 11. Six friends like museums A and B; two friends like market C and D
def test_11_six_friends_vs_two_friends():
    v = votes({
        **{u: {"A": True, "B": True} for u in "abcdef"},
        "g": {"C": True, "D": True},
        "h": {"C": True, "D": True},
    })
    r = select_places(list("abcdefgh"), v, k=3)
    assert sorted(p.place_id for p in r.picks) == ["A", "B", "C"]
    assert all(r.included_count[u] == 2 for u in "abcdef")
    assert r.included_count["g"] == 1 and r.included_count["h"] == 1
    assert r.min_satisfaction == pytest.approx(0.5)


# 12. Same yes votes: the place with more net votes (fewer no votes) wins
def test_12_net_votes_decide_when_yes_votes_tie():
    v = votes({
        "a": {"X": True, "Y": True},
        "b": {"X": True, "Y": True},
        "c": {"X": False},
    })
    r = select_places(["a", "b", "c"], v, k=1)
    assert [p.place_id for p in r.picks] == ["Y"]


# 13. Changed vote: only the latest vote counts
def test_13_changed_vote_counts_latest():
    v = [
        Vote("a", "x", True),
        Vote("a", "x", False),  # Ana changed her mind
        Vote("a", "y", True),
        Vote("b", "y", True),
    ]
    r = select_places(["a", "b"], v, k=2)
    assert [p.place_id for p in r.picks] == ["y"]  # x has no yes votes any more
    assert r.min_satisfaction == 1.0


# 14. Only one friend on the trip
def test_14_one_friend_on_the_trip():
    v = votes({"ana": {"p1": True, "p2": True, "p3": True}})
    r = select_places(["ana"], v, k=2)
    assert [p.place_id for p in r.picks] == ["p1", "p2"]
    assert r.min_satisfaction == pytest.approx(2 / 3)


# 15. Nobody liked anything
def test_15_nobody_liked_anything_gives_an_empty_plan():
    v = votes({"a": {"x": False}, "b": {"y": False}})
    r = select_places(["a", "b"], v, k=3)
    assert r.picks == []
    assert r.min_satisfaction is None


# 16. No places wanted
def test_16_zero_places_gives_an_empty_plan():
    v = votes({"a": {"x": True}, "b": {"y": True}})
    r = select_places(["a", "b"], v, k=0)
    assert r.picks == []
    assert r.min_satisfaction == 0.0