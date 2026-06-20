# Write-up source onboarding

Prefer RSS or a documented JSON API. Before enabling a source, review its terms of service, license, attribution requirements, source language, expected security-research content, allowed hostname, review requirement, and safe polling frequency. Check robots rules before considering any scrape-based retrieval.

Never onboard an arbitrary URL. Only approved domains may be fetched through a future hardened fetch proxy. The proxy must validate every redirect, reject localhost/private/link-local/metadata IP ranges, restrict protocols and MIME types, and apply response/time limits. Store no source credentials in HackPath source records.

Start every new source disabled or review-required, perform a controlled fixture run, check duplicate behavior and attribution, then enable it. Auto-publishing is not supported.
