"""Rebuild the committed, deterministic download after editing workbook files."""
from pathlib import Path
import hashlib
import json
import zipfile

site = Path(__file__).resolve().parents[1]
folder = site / 'public/downloads/launch-workbook-v1'
archive = site / 'public/downloads/starlight-launch-workbook-v1.zip'
files = sorted(path for path in folder.iterdir() if path.is_file())
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as bundle:
    for path in files:
        entry = zipfile.ZipInfo(f'launch-workbook-v1/{path.name}', (2026, 10, 27, 0, 0, 0))
        entry.external_attr = 0o644 << 16
        bundle.writestr(entry, path.read_bytes())
manifest = {
    'version': '1.0.0',
    'archive': '/downloads/starlight-launch-workbook-v1.zip',
    'bytes': archive.stat().st_size,
    'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
    'files': [{
        'name': path.name,
        'bytes': path.stat().st_size,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
    } for path in files],
}
(site / 'public/downloads/launch-workbook-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Built {archive.name}: {len(files)} files; SHA256 {manifest["sha256"]}')
