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

import { ToDos } from '../dataStore';
import TodoItemComponent from './TodoItem.vue';

@Component( {
	components: { TodoItemComponent },
} )
export default class AppComponent extends Vue {
	// # Initialization

	// When starting up the app, insert fake data
	public async mounted(){
		await ToDos.insertMany( [
			{ label: 'Check the documentation', finished: true },
			{ label: 'Finish the tutorial', finished: false },
		] );
		// TODO: Do searches with the model...
	}
}
</script>
