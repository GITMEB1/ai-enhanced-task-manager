/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('journal_templates', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    table.string('name', 255).notNullable();
    table.text('description');
    table.text('template_content').notNullable();
    table.string('entry_type', 50).defaultTo('general');
    
    // Template Configuration
    table.jsonb('prompt_questions').defaultTo('[]');
    table.jsonb('default_tags').defaultTo('[]');
    table.boolean('requires_mood').defaultTo(false);
    table.boolean('requires_energy').defaultTo(false);
    
    // Usage Tracking
    table.integer('usage_count').defaultTo(0);
    table.timestamp('last_used_at');
    
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id', 'is_active'], 'idx_journal_templates_user_active');
    table.index(['user_id', 'entry_type'], 'idx_journal_templates_type');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('journal_templates');
}; 