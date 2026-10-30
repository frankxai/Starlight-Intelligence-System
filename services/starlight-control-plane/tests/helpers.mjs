import { DatabaseSync } from 'node:sqlite';
import * as core from '../src/core.ts';

export function memorySql() {
  const db = new DatabaseSync(':memory:');
  const sql = {
    exec: (q, ...binds) => db.prepare(q).all(...binds).map((r) => ({ ...r })),
    transaction: (fn) => {
      db.exec('BEGIN');
      try {
        const out = fn();
        db.exec('COMMIT');
        return out;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },
  };
  core.migrate(sql);
  return sql;
}
