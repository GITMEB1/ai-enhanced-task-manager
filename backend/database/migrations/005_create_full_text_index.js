/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
    -- Create full-text search index on tasks title and description
    CREATE INDEX tasks_search_idx ON tasks 
    USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
    
    -- Create index for user-specific queries with due dates
    CREATE INDEX tasks_user_due_idx ON tasks (project_id, due_at) 
    WHERE project_id IS NOT NULL;
    
    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Create triggers to automatically update updated_at
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
    CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    -- Drop triggers
    DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
    DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    
    -- Drop function
    DROP FUNCTION IF EXISTS update_updated_at_column();
    
    -- Drop indexes
    DROP INDEX IF EXISTS tasks_user_due_idx;
    DROP INDEX IF EXISTS tasks_search_idx;
  `);
}; 