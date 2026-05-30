import json
import os
import sys
import time
from typing import Any, Dict, Iterable, Optional, Tuple

import httpx


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}")
    raise AssertionError(msg)


def ok(msg: str) -> None:
    print(f"[OK] {msg}")


def sse_events(lines: Iterable[str]) -> Iterable[Dict[str, Any]]:
    buf: list[str] = []
    for raw in lines:
        line = raw.rstrip("\r\n")
        if line == "":
            if not buf:
                continue
            data_lines = []
            for l in buf:
                if l.startswith("data:"):
                    data_lines.append(l[5:].lstrip())
            buf = []
            if not data_lines:
                continue
            yield json.loads("\n".join(data_lines))
            continue
        buf.append(line)


def fetch_json(client: httpx.Client, method: str, url: str, **kwargs: Any) -> Tuple[int, Any]:
    r = client.request(method, url, **kwargs)
    try:
        return r.status_code, r.json()
    except Exception:
        return r.status_code, r.text


def main() -> int:
    base_url = os.environ.get("EUREKA_API_URL", "http://localhost:8000").rstrip("/")
    timeout = httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)

    with httpx.Client(base_url=base_url, timeout=timeout) as client:
        code, body = fetch_json(client, "GET", "/health")
        if code != 200 or not isinstance(body, dict) or body.get("status") != "healthy":
            fail(f"GET /health unexpected: {code} {body}")
        ok("GET /health")

        code, body = fetch_json(client, "POST", "/api/cache/reset")
        if code != 200:
            fail(f"POST /api/cache/reset unexpected: {code} {body}")
        ok("POST /api/cache/reset")

        code, body = fetch_json(client, "GET", "/api/cache/stats")
        if code != 200 or not isinstance(body, dict) or "total_entries" not in body:
            fail(f"GET /api/cache/stats unexpected: {code} {body}")
        ok("GET /api/cache/stats")

        topic = f"blackbox test topic {int(time.time())}"
        code, body = fetch_json(client, "POST", "/api/pipeline/start", json={"topic": topic})
        if code != 200 or not isinstance(body, dict) or "pipeline_id" not in body:
            fail(f"POST /api/pipeline/start unexpected: {code} {body}")
        pipeline_id = body["pipeline_id"]
        ok(f"POST /api/pipeline/start -> {pipeline_id}")

        stream_timeout = httpx.Timeout(connect=5.0, read=90.0, write=10.0, pool=5.0)
        got_status = False
        got_result = False
        got_error: Optional[str] = None
        stream_result: Optional[Dict[str, Any]] = None

        with client.stream(
            "GET",
            f"/api/pipeline/{pipeline_id}/stream",
            headers={"Accept": "text/event-stream"},
            timeout=stream_timeout,
        ) as r:
            if r.status_code != 200:
                fail(f"GET /api/pipeline/{{id}}/stream unexpected: {r.status_code} {r.text}")

            for ev in sse_events(r.iter_lines()):
                if not isinstance(ev, dict) or "type" not in ev:
                    continue

                if ev["type"] == "status":
                    got_status = True
                    continue

                if ev["type"] == "error":
                    got_error = str(ev.get("message", "unknown error"))
                    break

                if ev["type"] == "result":
                    got_result = True
                    data = ev.get("data")
                    if not isinstance(data, dict):
                        fail(f"SSE result event has invalid data: {ev}")
                    stream_result = data
                    break

        if got_error:
            fail(f"SSE error: {got_error}")
        if not got_status:
            fail("SSE did not emit any status event")
        if not got_result or not stream_result:
            fail("SSE did not emit result event")
        ok("GET /api/pipeline/{id}/stream (SSE status + result)")

        result: Optional[Dict[str, Any]] = None
        for _ in range(180):
            code, body = fetch_json(client, "GET", f"/api/pipeline/{pipeline_id}/result")
            if code == 200 and isinstance(body, dict):
                result = body
                break
            if code not in (200, 202):
                fail(f"GET /api/pipeline/{{id}}/result unexpected: {code} {body}")
            time.sleep(0.5)

        if not result:
            fail("GET /api/pipeline/{id}/result timed out waiting for completion")
        ok("GET /api/pipeline/{id}/result")

        ideas = result.get("ideas")
        if not isinstance(ideas, list) or not ideas:
            fail("Pipeline result has no ideas")
        first_idea = ideas[0]
        if not isinstance(first_idea, dict) or "id" not in first_idea:
            fail("Pipeline result idea item invalid")
        idea_id = first_idea["id"]

        code, body = fetch_json(
            client,
            "POST",
            f"/api/ideas/{idea_id}/override",
            json={"idea_id": idea_id, "novelty_override": 88, "feasibility_override": 77},
        )
        if code != 200 or not isinstance(body, dict) or body.get("status") != "success":
            fail(f"POST /api/ideas/{{id}}/override unexpected: {code} {body}")
        updated = body.get("idea")
        if not isinstance(updated, dict) or not updated.get("is_human_adjusted"):
            fail(f"Override did not mark is_human_adjusted: {body}")
        ok("POST /api/ideas/{id}/override")

        code, body = fetch_json(client, "GET", "/api/cache/stats")
        if code != 200 or not isinstance(body, dict):
            fail(f"GET /api/cache/stats unexpected: {code} {body}")
        if int(body.get("total_entries", 0)) <= 0:
            fail(f"Cache stats did not increase after run: {body}")
        ok("GET /api/cache/stats (post-run)")

    print("ALL PASSED")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except AssertionError:
        sys.exit(1)
