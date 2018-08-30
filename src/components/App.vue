<template>
	<div>
		<header class="header">
			<h1>todos</h1>
			<input class="new-todo" placeholder="What needs to be done?" autofocus @keyup.enter="createTodo" v-model="newTodoLabel">
		</header>
		<!-- This section should be hidden by default and shown when there are todos -->
		<section class="main" v-if="hasTodos">
			<!-- See *ToDos cleaning* below -->
			<input id="toggle-all" class="toggle-all" type="checkbox" v-model="areAllFinished">
			<label for="toggle-all">Mark all as complete</label>

			<ul class="todo-list">
				<!-- Iterate on each ToDo. Because the `ID` depends on the source, -->
				<!-- we have to specify which datasource's ID we should bind to.   -->
				<!-- When the item emits the `refresh` event, reload ToDos lists   -->
				<todo-item-component
					v-for="todo in displayedTodos.entities"
					:todo="todo"
					v-bind:key="todo.getId('main')"
					@refresh="refreshToDoSearches"></todo-item-component>
			</ul>
		</section>
		<!-- This footer should be hidden by default and shown when there are todos -->
		<footer class="footer" v-if="hasTodos">
			<!-- This should be `0 items left` by default -->
			<span class="todo-count"><strong>{{leftTodos}}</strong> {{leftTodosLabel}} left</span>

			<ul class="filters">
				<li><router-link to="/" exact-active-class="selected">All</router-link></li>
				<li><router-link to="/active" exact-active-class="selected">Active</router-link></li>
				<li><router-link to="/completed" exact-active-class="selected">Completed</router-link></li>
			</ul>
			<!-- Hidden if no completed items are left ↓ -->
			<button class="clear-completed" @click="clearCompleted">Clear completed</button>
		</footer>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Entity, Set } from '@diaspora/diaspora';

import { EDisplayMode } from '../router/EDisplayMode';
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

	// Getter to use `areAllFinished` as v-model
	public get areAllFinished(){
		return this.allTodosFinished;
	}

	// Set all ToDos `finished` status.
	public set areAllFinished( finished: boolean ){
		ToDos.updateMany( {}, { finished } ).then( () => this.refreshToDoSearches() );
	}

	// ## Unfinished ToDos
	// Used in the footer's text
	public leftTodos = 0;

	// Get the singular or plural text to display in the footer
	public get leftTodosLabel(){
		return this.leftTodos === 1 ? 'item' : 'items';
	}


	// # Search

	// Current search mode, representing the status of the ToDos to display in the list
	private displayMode: EDisplayMode = EDisplayMode.ALL;

	// Refresh all ToDos searches.
	private async refreshToDoSearches(){
		let allTodos: Set<ITodo>;
		let hasTodos: Entity<ITodo> | null;
		let leftTodos: Set<ITodo>;

		switch ( this.displayMode ) {
			case EDisplayMode.ALL: {
				[allTodos, hasTodos, leftTodos] = await Promise.all( [
					// Assign to `displayedTodos`, and check if all are finished for `allTodosFinished`
					ToDos.findMany(),
					// Check if null for `hasTodos`
					ToDos.find(),
					// Count the results for `leftTodos`
					ToDos.findMany( { finished: false } ),
				] );
				this.displayedTodos = allTodos;
			}                      break;

			case EDisplayMode.FINISHED: {
				[this.displayedTodos, allTodos, hasTodos, leftTodos] = await Promise.all( [
					// Displayed items
					ToDos.findMany( { finished: true } ),
					// Check if all are finished for `allTodosFinished`
					ToDos.findMany(),
					// Check if null for `hasTodos`
					ToDos.find(),
					// Count the results for `leftTodos`
					ToDos.findMany( { finished: false } ),
				] );
			}                           break;

			case EDisplayMode.UNFINISHED: {
				[allTodos, hasTodos, leftTodos] = await Promise.all( [
					// Check if all are finished for `allTodosFinished`
					ToDos.findMany(),
					// Check if null for `hasTodos`
					ToDos.find(),
					// Assign to `displayedTodos`, and count the results for `leftTodos`
					ToDos.findMany( { finished: false } ),
				] );
				this.displayedTodos = leftTodos;
			}                             break;

			default: throw new Error( 'Invalid search mode' );
		}

		// Assign to properties requiring additionnal logic
		this.allTodosFinished = allTodos
			.toChainable( Set.ETransformationMode.ATTRIBUTES )
			.every( todo => todo.finished )
			.value();
		this.hasTodos = hasTodos !== null;
		this.leftTodos = leftTodos.length;
	}

	// # Routing

	// Current route used by the app. See `../router/index.ts`.
	public $route!: Route;

	// Every time the route change:
	// * set the `displayMode` property to the one configured on the route
	// * then refresh the ToDos lists
	@Watch( '$route' )
	private async onRouteChanged(){
		if ( this.$route.matched && this.$route.matched.length === 1 ){
			const matched = this.$route.matched[0];
			this.displayMode = ( matched.props as {default: {displayMode: EDisplayMode}} ).default.displayMode;
		}
		await this.refreshToDoSearches();
	}


	// # ToDos creation

	// Model property that contains the label of the ToDo we are creating
	public newTodoLabel = '';

	// Trim the label, then inserts it in the store & refresh the ToDos lists
	public async createTodo(){
		const todoLabel = this.newTodoLabel.trim();
		if ( todoLabel === '' ){
			return;
		}
		this.newTodoLabel = '';
		await ToDos.insert( { label: todoLabel, finished: false } );
		await this.refreshToDoSearches();
	}


	// # ToDos cleaning

	// Delete all completed ToDos, then refresh the ToDos lists
	public async clearCompleted(){
		await ToDos.deleteMany( {finished: true} );
		await this.refreshToDoSearches();
	}


	// # Initialization

	// When starting up the app, insert fake data
	public async mounted(){
		await ToDos.insertMany( [
			{ label: 'Check the documentation', finished: true },
			{ label: 'Finish the tutorial', finished: false },
		] );
		await this.onRouteChanged();
	}
}
</script>
