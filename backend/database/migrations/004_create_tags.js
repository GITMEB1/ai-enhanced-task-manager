/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('tags', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable();
      table.string('name').notNullable();
      table.string('color').defaultTo('#64748b'); // Default slate color
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Foreign key relationships
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Unique constraint for user-specific tag names
      table.unique(['user_id', 'name']);
      
      // Indexes
      table.index('user_id');
    })
    .createTable('task_tags', table => {
      table.uuid('task_id').notNullable();
      table.uuid('tag_id').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Foreign key relationships
      table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');
      table.foreign('tag_id').references('id').inTable('tags').onDelete('CASCADE');
      
      // Composite primary key
      table.primary(['task_id', 'tag_id']);
      
      // Indexes
      table.index('task_id');
      table.index('tag_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('task_tags')
    .dropTable('tags');
}; 