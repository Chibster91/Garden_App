CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  picture_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE seeds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  variety TEXT,
  brand TEXT,
  year INTEGER,
  quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'unopened' CHECK (status IN ('unopened','opened','low','empty')),
  photo_front_key TEXT,
  photo_back_key TEXT,
  notes TEXT,
  sow_indoor_start TEXT,
  sow_indoor_end TEXT,
  sow_direct_start TEXT,
  sow_direct_end TEXT,
  depth_in REAL,
  spacing_in REAL,
  germ_days_min INTEGER,
  germ_days_max INTEGER,
  germ_temp_f_min INTEGER,
  germ_temp_f_max INTEGER,
  light_needs TEXT CHECK (light_needs IN ('full_sun','partial_sun','shade') OR light_needs IS NULL),
  days_to_harvest_min INTEGER,
  days_to_harvest_max INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_seeds_user ON seeds(user_id);

CREATE TABLE planted (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seed_id TEXT NOT NULL REFERENCES seeds(id) ON DELETE RESTRICT,
  location TEXT,
  date_planted TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'seedling' CHECK (stage IN ('seedling','vegetative','flowering','fruiting','harvested','removed')),
  photo_keys TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_planted_user ON planted(user_id);
CREATE INDEX idx_planted_seed ON planted(seed_id);

CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  planted_id TEXT REFERENCES planted(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('observation','pest','harvest','action','note')),
  entry_date TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  text TEXT,
  photo_keys TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_planted ON journal_entries(planted_id);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  planted_id TEXT REFERENCES planted(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('water','transplant','fertilize','check_pests','other')),
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  is_done INTEGER NOT NULL DEFAULT 0,
  done_at TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','rule')),
  rule_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_planted ON tasks(planted_id);
CREATE INDEX idx_tasks_due ON tasks(user_id, due_date, is_done);
