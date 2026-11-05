# Lisbon blog publication

Publish the supplied English Lisbon travel essay in Culture & Ideas, following the existing
Hugo article conventions. Edit repetition without inventing personal experiences. Retain the
document photographs that support the story and add three people-free architectural photographs
from the supplied album. Preserve the final couple photograph as the exact embedded PNG.

Affected files are the new culture article, its local image directory, this plan, the ledger,
and project memory. Add responsive automatic height to prose images in `assets/site.css` so
explicit image dimensions prevent layout shifts without stretching pictures on narrow screens.
No templates or hosting configuration need changes.

Success means the article is listed on Blogs, all images load with captions and alt text,
the final photograph matches the DOCX bytes, and the published page works on desktop and mobile.
Album timestamps differ from the document's Belém chronology, so describe that section by place
rather than asserting an exact day. Keep photographed prices distinct from national statistics.

Validate with Hugo, both existing PowerShell verification scripts, asset-reference and image-hash
checks, browser review, GitHub Actions, and live article/image checks after deployment.
