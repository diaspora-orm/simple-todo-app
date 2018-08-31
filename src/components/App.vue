<template>
	<div>
		<header class="header">
			<h1>todos</h1>
			<input class="new-todo" placeholder="What needs to be done?" autofocus />
		</header>
		<!-- This section should be hidden by default and shown when there are todos -->
		<section class="main">
			<!-- See *ToDos cleaning* below -->
			<input id="toggle-all" class="toggle-all" type="checkbox">
			<label for="toggle-all">Mark all as complete</label>

			<ul class="todo-list">
			</ul>
		</section>
		<!-- This footer should be hidden by default and shown when there are todos -->
		<footer class="footer">
			<!-- This should be `0 items left` by default -->
			<span class="todo-count"><strong>_</strong> _ left</span>

			<ul class="filters">
				<li><a href="/#/" >All</a></li>
				<li><a href="/#/active">Active</a></li>
				<li><a href="/#/completed">Completed</a></li>
			</ul>
			<!-- Hidden if no completed items are left ↓ -->
			<button class="clear-completed">Clear completed</button>
		</footer>
	</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Entity, Set } from '@diaspora/diaspora';

import { ToDos, ITodo } from '../dataStore';
import TodoItemComponent from './TodoItem.vue';

@Component( {
	components: { TodoItemComponent },
} )
export default class AppComponent extends Vue {
	// # ToDos searches

	// ## ToDos currently displayed
	public displayedTodos: Set<ITodo> | null = null;

	// ## Boolean checking if the data source contains at least one ToDo
	// It is used to display or hide the header & footer.
	public hasTodos = false;

	// ## Boolean checking if all ToDos are finished
	private allTodosFinished = false;

	// ## Unfinished ToDos
	// Used in the footer's text
	public leftTodos = 0;


	// # Search

	// Refresh all ToDos searches.
	private async refreshToDoSearches(){
		let allTodos: Set<ITodo>;
		let hasTodos: Entity<ITodo> | null;
		let leftTodos: Set<ITodo>;

		[allTodos, hasTodos, leftTodos] = await Promise.all( [
			// Assign to `displayedTodos`, and check if all are finished for `allTodosFinished`
			ToDos.findMany(),
			// Check if null for `hasTodos`
			ToDos.find(),
			// Count the results for `leftTodos`
			ToDos.findMany( { finished: false } ),
		] );
		this.displayedTodos = allTodos;

		// Assign to properties requiring additionnal logic
		this.allTodosFinished = allTodos
			.toChainable( Set.ETransformationMode.ATTRIBUTES )
			.every( todo => todo.finished )
			.value();
		this.hasTodos = hasTodos !== null;
		this.leftTodos = leftTodos.length;
	}


	// # Initialization

	// When starting up the app, insert fake data
	public async mounted(){
		await ToDos.insertMany( [
			{ label: 'Check the documentation', finished: true },
			{ label: 'Finish the tutorial', finished: false },
		] );
		await this.refreshToDoSearches();
	}
}
</script>
