import json

import httpx
import pytest

from app.services.routing import (
    LINZ_CENTRE, RoutingUnavailable, Stop, build_request, clock, plan_days,
)

# Real coordinates from data/places.json. Opening hours are test data, not checked facts.
COORDS = {
    "linz-hauptplatz": (48.3069, 14.2858),
    "linz-lentos": (48.3059, 14.2920),
    "linz-ars-electronica-center": (48.3243, 14.2865),
    "linz-poestlingberg-wallfahrtskirche": (48.3207, 14.2673),
    "linz-brucknerhaus": (48.3129, 14.2950),
}


def linz_stops() -> list[Stop]:
    return [
        Stop("linz-hauptplatz", *COORDS["linz-hauptplatz"]),                       # no hours known
        Stop("linz-lentos", *COORDS["linz-lentos"], opens=clock("10:00"), closes=clock("18:00")),
        Stop("linz-ars-electronica-center", *COORDS["linz-ars-electronica-center"],
             opens=clock("09:00"), closes=clock("17:00")),
        Stop("linz-poestlingberg-wallfahrtskirche", *COORDS["linz-poestlingberg-wallfahrtskirche"]),
        Stop("linz-brucknerhaus", *COORDS["linz-brucknerhaus"], opens=clock("17:00"), closes=clock("22:00")),
    ]


# What ORS answers for those 5 places on 2 days: day 1 = places 1, 2, 5; day 2 = places 3, 4.
ORS_ANSWER_TWO_DAYS = {
    "routes": [
        {"vehicle": 1, "duration": 5400, "distance": 6100, "steps": [
            {"type": "start"}, {"type": "job", "job": 1}, {"type": "job", "job": 2},
            {"type": "job", "job": 5}, {"type": "end"}]},
        {"vehicle": 2, "duration": 4200, "distance": 7900, "steps": [
            {"type": "start"}, {"type": "job", "job": 3}, {"type": "job", "job": 4},
            {"type": "end"}]},
    ],
    "unassigned": [],
}


def fake_ors(answer=None, status=200, seen=None):
    """A fake ORS server. It records each request body in `seen`."""
    def handler(request: httpx.Request) -> httpx.Response:
        if seen is not None:
            seen.append(json.loads(request.content))
        if status != 200:
            return httpx.Response(status, json={"error": "fake error"})
        return httpx.Response(200, json=answer)
    return httpx.MockTransport(handler)


def test_1_request_uses_lon_lat_and_one_vehicle_per_day():
    body = build_request(linz_stops(), days=2)
    assert body["jobs"][0]["location"] == [14.2858, 48.3069]    # [lng, lat], not [lat, lng]
    assert [v["id"] for v in body["vehicles"]] == [1, 2]
    assert body["vehicles"][0]["start"] == list(LINZ_CENTRE)
    assert body["vehicles"][0]["time_window"] == [8 * 3600, 21 * 3600]


def test_2_only_places_with_hours_get_a_time_window():
    body = build_request(linz_stops(), days=2)
    hauptplatz, lentos = body["jobs"][0], body["jobs"][1]
    assert "time_windows" not in hauptplatz                      # no hours -> no window
    assert lentos["time_windows"] == [[clock("10:00"), clock("18:00")]]


def test_3_two_day_plan_keeps_the_order_ors_returns():
    seen = []
    plan = plan_days(linz_stops(), days=2, api_key="test-key", transport=fake_ors(ORS_ANSWER_TWO_DAYS, seen=seen))
    assert plan.days[0].place_ids == ("linz-hauptplatz", "linz-lentos", "linz-brucknerhaus")
    assert plan.days[1].place_ids == ("linz-ars-electronica-center", "linz-poestlingberg-wallfahrtskirche")
    assert plan.days[0].duration_s == 5400 and plan.days[0].distance_m == 6100
    assert plan.unassigned == ()
    assert len(seen) == 1                                        # exactly one API call


def test_4_place_ors_cannot_fit_is_reported_as_unassigned():
    day1 = [{"type": "start"}, {"type": "job", "job": 1}, {"type": "job", "job": 2}, {"type": "end"}]
    answer = {
        "routes": [{"vehicle": 1, "steps": day1, "duration": 3000, "distance": 4000},
                   ORS_ANSWER_TWO_DAYS["routes"][1]],
        "unassigned": [{"id": 5, "type": "job"}],   # Brucknerhaus opens 17:00: no day fits it
    }
    plan = plan_days(linz_stops(), days=2, api_key="test-key", transport=fake_ors(answer))
    assert plan.unassigned == ("linz-brucknerhaus",)
    placed = [p for day in plan.days for p in day.place_ids]
    assert "linz-brucknerhaus" not in placed


def test_5_every_place_is_either_placed_or_unassigned_exactly_once():
    plan = plan_days(linz_stops(), days=2, api_key="test-key", transport=fake_ors(ORS_ANSWER_TWO_DAYS))
    used = sorted([p for day in plan.days for p in day.place_ids] + list(plan.unassigned))
    assert used == sorted(stop.place_id for stop in linz_stops())


def test_6_no_key_raises_and_never_calls_the_api():
    def must_not_be_called(request: httpx.Request):
        raise AssertionError("the API must not be called without a key")

    with pytest.raises(RoutingUnavailable, match="ORS_API_KEY"):
        plan_days(linz_stops(), days=2, api_key="", transport=httpx.MockTransport(must_not_be_called))


def test_7_server_error_raises_routing_unavailable():
    with pytest.raises(RoutingUnavailable):
        plan_days(linz_stops(), days=2, api_key="test-key", transport=fake_ors(status=500))


def test_8_wrong_shape_answer_raises_routing_unavailable():
    with pytest.raises(RoutingUnavailable):
        plan_days(linz_stops(), days=2, api_key="test-key", transport=fake_ors({"nope": 1}))


def test_9_timeout_raises_routing_unavailable():
    def slow(request: httpx.Request):
        raise httpx.ReadTimeout("took too long", request=request)

    with pytest.raises(RoutingUnavailable):
        plan_days(linz_stops(), days=2, api_key="test-key", transport=httpx.MockTransport(slow))


def test_10_more_days_than_places_is_capped():
    two_places_answer = {"routes": [
        {"vehicle": 1, "steps": [{"type": "job", "job": 1}]},
        {"vehicle": 2, "steps": [{"type": "job", "job": 2}]},
    ], "unassigned": []}
    seen = []
    plan_days(linz_stops()[:2], days=5, api_key="test-key", transport=fake_ors(two_places_answer, seen=seen))
    assert len(seen[0]["vehicles"]) == 2                         # 2 places -> at most 2 days


def test_11_no_places_gives_an_empty_plan_without_calling_the_api():
    def must_not_be_called(request: httpx.Request):
        raise AssertionError("no places, so no API call")

    plan = plan_days([], days=2, api_key="test-key", transport=httpx.MockTransport(must_not_be_called))
    assert plan.days == () and plan.unassigned == ()


def test_12_clock_converts_text_to_seconds():
    assert clock("10:30") == 37800
    assert clock("00:00") == 0