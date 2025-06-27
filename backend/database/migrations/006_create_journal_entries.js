/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('journal_entries', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Content & Metadata
    table.string('title', 255);
    table.text('content').notNullable();
    table.string('entry_type', 50).defaultTo('general');
    
    // Timing & Context
    table.date('entry_date').notNullable();
    table.string('time_of_day', 20);
    
    // Categorization
    table.jsonb('tags').defaultTo('[]');
    table.integer('mood_rating').checkBetween([1, 10]);
    table.integer('energy_level').checkBetween([1, 10]);
    
    // Relationships
    table.jsonb('related_task_ids').defaultTo('[]');
    table.jsonb('related_project_ids').defaultTo('[]');
    
    // Rich Content
    table.jsonb('attachments').defaultTo('[]');
    table.jsonb('metadata').defaultTo('{}');
    
    // Analytics Fields
    table.integer('word_count').defaultTo(0);
    table.integer('reading_time_minutes').defaultTo(0);
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for performance
    table.index(['user_id', 'entry_date'], 'idx_journal_entries_user_date');
    table.index(['user_id', 'entry_type'], 'idx_journal_entries_type');
    table.index(['user_id', 'mood_rating'], 'idx_journal_entries_mood');
    table.index('tags', 'idx_journal_entries_tags', 'gin');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('journal_entries');
}; 