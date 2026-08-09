// Transcribed from the package's own drizzle schema (src/drizzle/schema.ts), which is
// the coupling this file cannot avoid: the browser has no migration tooling, so the DDL
// is duplicated here. Playground.tsx guards it with a round trip on boot, so a schema
// that has moved on fails loudly on the demo rather than rendering a subtly wrong tree.
export const PLAYGROUND_DDL = `
CREATE TABLE IF NOT EXISTS ai_sdk_threads (
  id text PRIMARY KEY,
  user_id text,
  title text,
  visibility text NOT NULL DEFAULT 'private',
  active_leaf_id text,
  active_stream_id text,
  metadata jsonb,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_sdk_messages (
  id text PRIMARY KEY,
  thread_id text NOT NULL REFERENCES ai_sdk_threads(id) ON DELETE CASCADE,
  parent_id text,
  role text NOT NULL,
  parts jsonb NOT NULL,
  metadata jsonb,
  sdk_version smallint NOT NULL DEFAULT 7,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_sdk_threads_user_created_idx
  ON ai_sdk_threads (user_id, created_at, id);
CREATE INDEX IF NOT EXISTS ai_sdk_messages_thread_idx
  ON ai_sdk_messages (thread_id);
`;
