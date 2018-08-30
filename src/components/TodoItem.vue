<template>
	<li
		v-bind:class="{ completed: finished }">
		<div class="view">
			<input class="toggle" type="checkbox" v-model="finished">
			<label>{{label}}</label>
			<button class="destroy"></button>
		</div>
		<input class="edit" />
	</li>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Entity } from '@diaspora/diaspora';

import { ITodo } from '../dataStore';

@Component
export default class TodoItemComponent extends Vue {
	// Current ToDo of this component. The app provides it as a parameter of the component
	@Prop( { required: true } )
	public todo!: Entity<ITodo>;

	// Handy getter for the ToDo's label
	public get label(){
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		return this.todo.attributes.label;
	}


	// # ToDo edition
	
	// ## `finished` toggling
	// Those are just handy shorthands to get/set the ToDo property, and persist it if required
	public get finished(){
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		return this.todo.attributes.finished;
	}
	public set finished( finished: boolean ){
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		this.todo.attributes.finished = finished;
		// Once the status is set, save then ask the app to reload its lists
		this.todo.persist().then( () => {
			this.$emit( 'refresh' );
		} );
	}
}
</script>
