/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('projects', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('title').notNullable();
    table.string('description').nullable();
    table.string('color').defaultTo('#6366f1'); // Default indigo color
    table.integer('order').defaultTo(0);
    table.boolean('is_archived').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign key relationships
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes for performance
    table.index(['user_id', 'order']);
    table.index(['user_id', 'is_archived']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('projects');
}; 