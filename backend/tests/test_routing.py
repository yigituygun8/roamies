import pytest

from app.services.routing import haversine_km, order_route, route_length_km, split_into_days


def test_haversine_known_distance():
    # Stephansdom -> Schönbrunn is about 5.1 km in a straight line
    assert haversine_km((48.2085, 16.3731), (48.1849, 16.3122)) == pytest.approx(5.1, abs=0.4)


def test_route_follows_a_line_without_zigzag():
    points = {"a": (48.0, 16.0), "c": (48.0, 16.2), "b": (48.0, 16.1), "d": (48.0, 16.3)}
    order = order_route(points)
    assert order in (["a", "b", "c", "d"], ["d", "c", "b", "a"])


def test_route_is_not_longer_than_input_order():
    points = {f"p{i}": (48.2 + (i % 3) * 0.01, 16.3 + (i * 7 % 5) * 0.01) for i in range(9)}
    order = order_route(points)
    assert sorted(order) == sorted(points)
    assert route_length_km(order, points) <= route_length_km(sorted(points), points) + 1e-9


def test_split_into_days_keeps_order_and_balances():
    assert split_into_days(list("abcdefg"), 3) == [["a", "b", "c"], ["d", "e"], ["f", "g"]]
    assert split_into_days(["a"], 3) == [["a"]]
    assert split_into_days([], 2) == [[]]