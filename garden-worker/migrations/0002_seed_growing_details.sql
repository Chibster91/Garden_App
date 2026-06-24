ALTER TABLE seeds ADD COLUMN sow_method TEXT;
ALTER TABLE seeds ADD COLUMN best_season TEXT;
ALTER TABLE seeds ADD COLUMN transplant_timing TEXT;
ALTER TABLE seeds ADD COLUMN ready_to_transplant TEXT;
ALTER TABLE seeds ADD COLUMN harden_off_days TEXT;
ALTER TABLE seeds ADD COLUMN water_needs TEXT;
ALTER TABLE seeds ADD COLUMN soil_needs TEXT;
ALTER TABLE seeds ADD COLUMN common_pests TEXT NOT NULL DEFAULT '[]';
