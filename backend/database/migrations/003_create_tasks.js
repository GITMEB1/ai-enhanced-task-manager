/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tasks', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').nullable(); // Nullable for inbox tasks
    table.uuid('parent_task_id').nullable(); // For sub-tasks
    table.string('title').notNullable();
    table.text('description').nullable();
    table.timestamp('due_at').nullable();
    table.integer('priority').defaultTo(1); // 1=low, 2=medium, 3=high, 4=urgent
    table.enu('status', ['todo', 'in_progress', 'completed', 'cancelled']).defaultTo('todo');
    table.jsonb('metadata').defaultTo('{}'); // Custom fields, energy level, duration, etc.
    table.integer('order').defaultTo(0);
    table.timestamp('completed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign key relationships
    table.foreign('project_id').references('id').inTable('projects').onDelete('SET NULL');
    table.foreign('parent_task_id').references('id').inTable('tasks').onDelete('CASCADE');
    
    // Indexes for performance as documented
    table.index(['project_id', 'due_at']);
    table.index(['status', 'due_at']);
    table.index('parent_task_id');
    table.index('created_at');
    
    // Full-text search index (will be created separately for PostgreSQL)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tasks');
}; 