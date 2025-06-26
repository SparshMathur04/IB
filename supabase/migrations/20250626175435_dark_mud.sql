/*
  # Enhance briefs table with rich data fields

  1. New Columns
    - `jobSignals` (json, array of job posting data)
    - `techStackDetail` (json, detailed tech stack with confidence)
    - `keyInsights` (json, array of key strategic insights)
    - `confidenceNotes` (text, data source confidence notes)
    - `companyLogo` (text, Clearbit logo URL)
    - `companyDomain` (text, extracted domain)

  2. Data Enhancement
    - Support for richer news data with sources
    - Enhanced job signal tracking
    - Tech stack confidence levels
    - Strategic insight tracking

  3. Indexes
    - Performance indexes for new fields
*/

-- Add new columns for enhanced data
DO $$
BEGIN
  -- Add jobSignals column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'jobSignals'
  ) THEN
    ALTER TABLE briefs ADD COLUMN "jobSignals" json DEFAULT '[]';
  END IF;

  -- Add techStackDetail column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'techStackDetail'
  ) THEN
    ALTER TABLE briefs ADD COLUMN "techStackDetail" json DEFAULT '[]';
  END IF;

  -- Add keyInsights column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'keyInsights'
  ) THEN
    ALTER TABLE briefs ADD COLUMN "keyInsights" json DEFAULT '[]';
  END IF;

  -- Add confidenceNotes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'confidenceNotes'
  ) THEN
    ALTER TABLE briefs ADD COLUMN "confidenceNotes" text DEFAULT '';
  END IF;

  -- Add companyLogo column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'companyLogo'
  ) THEN
    ALTER TABLE briefs ADD COLUMN "companyLogo" text DEFAULT '';
  END IF;

  -- Add companyDomain column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'briefs' AND column_name = 'companyDomain'
  ) THEN
    ALTER TABLE briefs ADD COLUMN "companyDomain" text DEFAULT '';
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_briefs_company_domain ON briefs("companyDomain");
CREATE INDEX IF NOT EXISTS idx_briefs_signal_tag_enhanced ON briefs("signalTag") WHERE "signalTag" IS NOT NULL AND "signalTag" != '';

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Public access to briefs" ON briefs;
CREATE POLICY "Public access to briefs"
  ON briefs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);