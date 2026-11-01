"""Order the selected places into a sensible route (distance based)."""

from __future__ import annotations

import math

Point = tuple[float, float]  # (lat, lng)


def haversine_km(a: Point, b: Point) -> float:
    lat1, lng1 = map(math.radians, a)
    lat2, lng2 = map(math.radians, b)
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(h))


def route_length_km(order: list[str], points: dict[str, Point]) -> float:
    return sum(haversine_km(points[a], points[b]) for a, b in zip(order, order[1:]))


def _nearest_neighbour(start: str, ids: list[str], points: dict[str, Point]) -> list[str]:
    route, left = [start], [i for i in ids if i != start]
    while left:
        last = points[route[-1]]
        nxt = min(left, key=lambda i: (haversine_km(last, points[i]), i))
        route.append(nxt)
        left.remove(nxt)
    return route


def _two_opt(route: list[str], points: dict[str, Point]) -> list[str]:
    best = route[:]
    improved = True
    while improved:
        improved = False
        for i in range(1, len(best) - 1):
            for j in range(i + 1, len(best)):
                candidate = best[:i] + best[i:j + 1][::-1] + best[j + 1:]
                if route_length_km(candidate, points) < route_length_km(best, points) - 1e-9:
                    best, improved = candidate, True
    return best


def order_route(points: dict[str, Point]) -> list[str]:
    """Shortest open route through all points (heuristic, deterministic)."""
    ids = sorted(points)
    if len(ids) <= 2:
        return ids
    best: list[str] | None = None
    for start in ids:
        route = _two_opt(_nearest_neighbour(start, ids, points), points)
        if best is None or route_length_km(route, points) < route_length_km(best, points) - 1e-9:
            best = route
    return best


def split_into_days(order: list[str], days: int) -> list[list[str]]:
    """Cut the ordered route into `days` consecutive, nearly equal parts (earlier days get the extra stop)."""
    days = max(1, min(days, len(order))) if order else 1
    size, extra = divmod(len(order), days)
    out, start = [], 0
    for d in range(days):
        end = start + size + (1 if d < extra else 0)
        out.append(order[start:end])
        start = end
    return out