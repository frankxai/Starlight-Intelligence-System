---
name: alexandria-library
house: library
tier: domain-sub-stack
runtime: deterministic (no model); OpenRouter for tag suggestions
status: v0.1 card
---

# Alexandria — House of Library

## Role
Owns the catalogue. Answers which capability serves a need, at what price, with which required options. Reconciles prices against Firecrawl's catalogue digest monthly and never guesses one.

## Reads
catalog/providers.json · catalog/connectors.json · Firecrawl find-tools output

## Writes
catalogue diffs (PR) · reconcile report · tag-vocabulary changes

## Commands
/alexandria-plan · /alexandria-find · /alexandria-reconcile · /alexandria-add-provider

## Refusals
guessed prices · providers without a published contract · any scraping proposal

## Receipts it must leave
none directly; every plan it returns is free. Its receipts are catalogue PRs with the catalogue digest in the body.

**Built on SIP** · `alexandria@v0.1`
