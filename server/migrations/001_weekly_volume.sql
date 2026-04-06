-- weekly_volume table
-- Tracks sets accumulated per user × week × muscle × pattern.
-- Used by the engine's volume guard to prevent overtraining.

CREATE TABLE IF NOT EXISTS weekly_volume (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT    NOT NULL DEFAULT 'default',
  week_start DATE    NOT NULL,           -- ISO Monday of the week
  muscle     TEXT    NOT NULL,
  pattern    TEXT    NOT NULL,
  sets       INTEGER NOT NULL DEFAULT 0,

  UNIQUE (user_id, week_start, muscle, pattern)
);

-- Index for fast weekly lookups
CREATE INDEX IF NOT EXISTS idx_weekly_volume_user_week
  ON weekly_volume (user_id, week_start);
