# Write-up admin guide

Administrators use `/admin/writeups` to view the current Write-up table and lifecycle controls. Create a manual entry with source attribution, English and Persian structured content, tags, existing vulnerability IDs, and existing lab keys. Do not enter raw HTML, credentials, flags, or full third-party text.

Lifecycle: draft → pending review → approved → scheduled/published. Reviewers may request revision or reject an item; published items can be archived. Publishing requires reviewed English and Persian translations at the domain-policy level. Schedule only approved items with a future time. Destructive actions require confirmation in the UI, but Laravel authorization is authoritative.

n8n imports must be checked for attribution, factual claims, language quality, duplicate warning, source trust, and missing fields before approval. Automation and source endpoints currently expose only the initial list/create monitoring surfaces; complete source editing and detailed automation monitoring remain implementation work.
