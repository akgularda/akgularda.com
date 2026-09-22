---
title: "What Palantir actually builds"
date: "2026-09-22"
lastmod: "2026-09-22"
description: "Past the headlines: ontology layers, data integration, and forward-deployed engineering — a case-study read of Palantir as infrastructure rather than myth."
tags: ["Palantir", "Data Integration", "Enterprise Software", "Case Study"]
categories: ["Technology & Public Life"]
slug: "what-palantir-actually-builds"
draft: false
---

My first impressions of Palantir came second-hand, the way most people's do: documentary tone, courtroom tone, or the tone of a keynote slide. None of those are good substitutes for reading what the company publishes about its own systems.

So I read the engineering material the way I would read a paper on distributed databases — slowly, with a highlighter, without performing a verdict for an audience.

## The product is integration, with opinions

Strip the branding and the core problem is familiar to anyone who has tried to run analysis across ten departments: data lives in incompatible stores, definitions disagree, and “one source of truth” is a slide rather than an artifact. Foundry-style platforms push on the same seam — ingest, normalize into shared types, expose datasets and interfaces that other tools can consume. The company's engineering posts talk about ontology modeling, lineage, and operational deployment the way infrastructure teams talk about anything else: constraints, failure modes, versioning.

Gotham sits on similar technical bones with a different deployment context. I care less about the acronym than about the pattern: put messy real-world entities into a model that software can query, then let workflows read from that model instead of from a folder of exports.

## Density of attention is the honest review

Critics worry that firms in this niche sell magic. Some vendors do. The useful test is boring: can you find primary documentation, postmortems, or engineering write-ups that specify what the system does under load and under dispute over definitions? Palantir's public engineering blog clears that bar often enough to reward reading.

That is all a case study needs to say. Situational awareness products are only as good as the entity model underneath them, and entity models are software work — hard, reviewable, uninterested in my political mood that afternoon.

I do not need to defend every client deployment to find the architecture worth studying. Infrastructure earns attention by being inspectable. I inspected it. The inspection holds.

### References

Palantir. (n.d.). *Engineering Blog*. https://blog.palantir.com/

Palantir. (n.d.). *Foundry Documentation*. https://docs.palantir.com/docs/

Palantir. (n.d.). *Artificial Intelligence Platform (AIP)*. https://www.palantir.com/platforms/aip/
