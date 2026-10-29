"""Lightweight schema sync: creates missing tables and adds missing columns.

Good enough for additive changes (new tables / nullable columns). For destructive changes
(rename, drop, type change) introduce Alembic. Existing data is never touched.
"""
import logging
from sqlalchemy import inspect, text
from .database import Base, engine
from . import models  # noqa: F401  (register tables)

log = logging.getLogger("adivasisetu")


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    insp = inspect(engine)
    for table in Base.metadata.sorted_tables:
        have = {c["name"] for c in insp.get_columns(table.name)}
        for col in table.columns:
            if col.name in have:
                continue
            ddl = col.type.compile(dialect=engine.dialect)
            with engine.begin() as conn:
                conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN "{col.name}" {ddl}'))
            log.info("added column %s.%s", table.name, col.name)
