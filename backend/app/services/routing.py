"""Order each trip day with the openrouteservice (ORS) optimisation API. ORS is the only router.

Flow:
1. One ORS "job" per place: its location, and its opening hours as a time window.
2. One ORS "vehicle" per trip day: the day's working hours and the start point.
3. ORS returns, for each vehicle, the order of its places that respects the time windows.

If ORS can't give a plan (no key, network, server error, bad answer), we raise
RoutingUnavailable. The caller turns that into an HTTP error. There is no offline fallback.

Things to know about ORS:
- coordinates are [longitude, latitude], the opposite of our (lat, lng)
- all times are seconds since midnight in this file
- the API key is read from the ORS_API_KEY environment variable, never written into code
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass

import httpx

log = logging.getLogger("roamies.routing")

ORS_URL = "https://api.openrouteservice.org/optimization"
PROFILE = "foot-walking"
DAY_START = 8 * 3600      # 08:00
DAY_END = 21 * 3600       # 21:00
TIMEOUT_SECONDS = 20.0
LINZ_CENTRE = (14.2858, 48.3069)  # Hauptplatz, [lng, lat]: default start of each day


class RoutingUnavailable(Exception):
    """ORS could not give a plan. The caller should return an error to the app (HTTP 502)."""


@dataclass(frozen=True)
class Stop:
    place_id: str
    lat: float
    lng: float
    opens: int | None = None   # seconds since midnight; None = no opening hours known
    closes: int | None = None


@dataclass(frozen=True)
class DayRoute:
    day: int
    place_ids: tuple[str, ...]
    duration_s: int | None = None
    distance_m: int | None = None


@dataclass(frozen=True)
class RoutePlan:
    days: tuple[DayRoute, ...]
    unassigned: tuple[str, ...]   # places ORS could not fit into any day


def clock(text: str) -> int:
    """'10:30' -> 37800 seconds since midnight."""
    hours, minutes = text.split(":")
    return int(hours) * 3600 + int(minutes) * 60


def api_key_from_env() -> str:
    return os.environ.get("ORS_API_KEY", "").strip()


def build_request(stops: list[Stop], days: int, start: tuple[float, float] = LINZ_CENTRE) -> dict:
    """The JSON body for ORS. Job ids are 1..n in the order of `stops`."""
    jobs = []
    for number, stop in enumerate(stops, start=1):
        job = {"id": number, "location": [stop.lng, stop.lat], "service": 0}
        if stop.opens is not None and stop.closes is not None:
            job["time_windows"] = [[stop.opens, stop.closes]]
        jobs.append(job)

    vehicles = [
        {"id": day, "profile": PROFILE, "start": list(start), "time_window": [DAY_START, DAY_END]}
        for day in range(1, days + 1)
    ]
    return {"jobs": jobs, "vehicles": vehicles}


def parse_response(data: dict, stops: list[Stop]) -> RoutePlan:
    """Turn ORS's answer into a plan. Raises KeyError/TypeError if the answer has the wrong shape."""
    place_by_job = {number: stop.place_id for number, stop in enumerate(stops, start=1)}

    day_routes = []
    for route in data["routes"]:
        ordered = tuple(
            place_by_job[step["job"]] for step in route["steps"] if step["type"] == "job"
        )
        day_routes.append(DayRoute(
            day=route["vehicle"],
            place_ids=ordered,
            duration_s=route.get("duration"),
            distance_m=route.get("distance"),
        ))

    unassigned = tuple(place_by_job[item["id"]] for item in data.get("unassigned", []))
    return RoutePlan(days=tuple(sorted(day_routes, key=lambda r: r.day)), unassigned=unassigned)


def plan_days(
    stops: list[Stop],
    days: int,
    api_key: str | None = None,
    start: tuple[float, float] = LINZ_CENTRE,
    transport: httpx.BaseTransport | None = None,
) -> RoutePlan:
    """Order the places of a trip over `days` days using ORS only.

    api_key: None = read ORS_API_KEY from the environment. "" is treated as no key.
    transport: lets tests replace the network with a fake answer.
    Raises RoutingUnavailable when ORS can't give a plan.
    """
    if not stops:
        return RoutePlan(days=(), unassigned=())

    days = max(1, min(days, len(stops)))  # never more days than places
    key = api_key_from_env() if api_key is None else api_key
    if not key:
        raise RoutingUnavailable("ORS_API_KEY is not set")

    try:
        with httpx.Client(transport=transport, timeout=TIMEOUT_SECONDS) as http:
            response = http.post(
                ORS_URL,
                json=build_request(stops, days, start),
                headers={"Authorization": key},
            )
        response.raise_for_status()
        return parse_response(response.json(), stops)
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as error:
        log.warning("ORS routing failed: %s", error)
        raise RoutingUnavailable("ORS could not create a route") from error