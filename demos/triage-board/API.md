# API contract

`POST /api/tickets` and `GET /api/tickets` are consumed by the **Zendesk sync worker** (owned by the platform team,
separate repo). Changes here need their sign-off.

## POST /api/tickets

```json
{ "title": "Card declined", "tag": "billing", "severity": "high" }
```

| Field | Rule |
|---|---|
| `title` | Required, non-empty after trimming |
| `tag` | Free text. Stored lowercase and trimmed |
| `severity` | Optional, defaults to `normal`. Must be exactly one of `low`, `normal`, `high`, `urgent` |

**`severity` is matched exactly and is case sensitive.** `"High"` and `"HIGH"` return 400, and the sync worker relies on
that. It forwards whatever the upstream helpdesk sends, and treats the 400 as its signal that a severity label changed
on their side. If this endpoint starts accepting variants, the worker stops noticing and silently writes tickets whose
severity no longer means what the dashboard assumes.

## GET /api/tickets

Returns open tickets. `?tag=` filters on the stored lowercase tag.

## Changing any of the above

The worker pins to this contract. Loosening validation is a breaking change for them even though it breaks nothing here.
