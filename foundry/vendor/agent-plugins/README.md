# Vendored Agent Plugins schemas

The `1.0.0/` directory is a byte-for-byte cache of the Agent Plugins 1.0.0 JSON
schemas. `provenance.json` pins each upstream URL and SHA-256 digest. The
conformance validator checks those digests before compiling either schema and
fails closed on drift.

The Agent Plugins project licenses schemas and other software material under
Apache-2.0. The authoritative licensing notice and license text remain linked
from `provenance.json`; no Starlight ownership is asserted over these files.

To update, add a new version directory or change a recorded digest in a reviewed
pull request. Refresh positive and negative fixtures and preserve the older
directory when receipts can still reference it.
