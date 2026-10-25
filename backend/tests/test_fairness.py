from app.services.fairness import Vote, select_places


def votes(table: dict[str, dict[str, bool]]) -> list[Vote]:
    return [Vote(u, p, liked) for u, row in table.items() for p, liked in row.items()]


def test_minority_member_gets_a_pick_that_majority_voting_would_skip():
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


def test_result_is_deterministic():
    v = votes({"a": {"x": True, "y": True, "z": True}, "b": {"x": True, "y": True, "z": True}})
    first = [p.place_id for p in select_places(["a", "b"], v, k=2).picks]
    for _ in range(5):
        assert [p.place_id for p in select_places(["a", "b"], v, k=2).picks] == first
    assert first == ["x", "y"]  # full tie -> alphabetical


def test_only_liked_places_are_candidates_and_k_is_capped():
    v = votes({"a": {"x": True, "y": False}, "b": {"x": False, "y": False}})
    r = select_places(["a", "b"], v, k=10)
    assert [p.place_id for p in r.picks] == ["x"]


def test_non_members_and_members_without_likes_are_ignored():
    v = votes({"a": {"x": True}, "stranger": {"y": True}})
    r = select_places(["a", "b"], v, k=5)
    assert [p.place_id for p in r.picks] == ["x"]
    assert r.liked_count["b"] == 0
    assert r.min_satisfaction == 1.0


def test_popular_places_win_once_everyone_is_covered():
    v = votes({
        "a": {"p1": True, "p2": True, "p3": True},
        "b": {"p1": True, "p2": True, "p3": False},
    })
    r = select_places(["a", "b"], v, k=2)
    assert [p.place_id for p in r.picks] == ["p1", "p2"]