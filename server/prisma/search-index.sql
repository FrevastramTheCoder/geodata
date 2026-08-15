CREATE INDEX IF NOT EXISTS idx_dataset_fts
ON "Dataset"
USING gin (to_tsvector('simple'::regconfig,
  coalesce("name", '') || ' ' ||
  coalesce("description", '')
));