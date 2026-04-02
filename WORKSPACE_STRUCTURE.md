# BWF Workspace Structure

This workspace is organized as a monorepo with separate product areas:

- `BWF-Backend` - API, auth, and data services
- `BWF-Web-Dashboard` - web dashboard (admin, student, warden)
- `BWF-student-dashboard` - dedicated student app
- `BWF-Mobile-App` - mobile application
- `BWF-ML-work` - ML experiments and notebooks
- `BWF-data` - managed datasets and spreadsheet intake
- `_archive` - legacy code snapshots (read-only reference)

## Data and Excel handling

Use `BWF-data/excel` as the single source for spreadsheet operations:

- `incoming` - raw files as received
- `processed` - cleaned and validated sheets
- `archive` - dated snapshots of old sheets
- `templates` - approved Excel templates
- `exports` - generated reports for sharing

Legacy sheets can remain temporarily in `BWF-data` root, then be moved into the folders above during normal maintenance.
