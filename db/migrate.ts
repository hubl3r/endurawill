import { sql } from '@vercel/postgres';

async function migrate() {
  try {
    // Enable RLS extension if needed
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    // Tenants table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Users table (linked to Clerk via clerk_id)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        clerk_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        dob DATE,
        state_residence TEXT,
        marital_status TEXT,  -- e.g., 'single', 'married'
        children JSONB,  -- array of {name, age, special_needs}
        pets JSONB,  -- similar array
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Profiles table (goals, complexity)
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        goals JSONB,  -- e.g., ['avoid_probate', 'minimize_taxes']
        complexity_level TEXT,  -- 'low', 'medium', 'high'
        selected_plan TEXT,  -- 'will', 'trust', 'bundle'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Assets table
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,  -- e.g., 'real_estate', 'bank_account'
        value NUMERIC,
        description TEXT,
        existing_beneficiaries JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Beneficiaries table
    await sql`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        relationship TEXT,
        percentage NUMERIC,
        is_contingent BOOLEAN DEFAULT FALSE,
        conditions JSONB,  -- e.g., age milestones
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Documents table (generated or uploaded files)
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,  -- 'will', 'trust', 'upload'
        url TEXT,  -- S3/Blob URL
        encrypted_content BYTEA,  -- Optional encrypted data
        status TEXT DEFAULT 'draft',  -- 'draft', 'signed', 'stored'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Directives table
    await sql`
      CREATE TABLE IF NOT EXISTS directives (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,  -- 'healthcare', 'poa'
        agent_name TEXT,
        details JSONB,  -- additional info
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Enable RLS on all tables (example for users; repeat for others)
    await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`;
    await sql`
      CREATE POLICY tenant_isolation ON users
      USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = current_setting('app.current_user_id')));
    `;  // Set current_user_id via app logic

    // Repeat RLS for other tables...

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
