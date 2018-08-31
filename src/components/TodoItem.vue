<template>
	<li
		v-bind:class="{ completed: finished, editing: isEditing, destroy: isHovered }"
		@mouseover="isHovered = true"
		@mouseout="isHovered = false">
		<div class="view">
			<input class="toggle" type="checkbox" v-model="finished">
			<label @dblclick="startEdit">{{label}}</label>
			<button class="destroy" @click="removeTodo"></button>
		</div>
		<input class="edit" v-model="editedLabel" @blur="saveEdit" @keyup.enter="saveEdit" @keyup.esc="discardEdit" ref="labelEdit">
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

	// Flag to avoid errors when entity is deleted
	private deleted = false;

	// Handy getter for the ToDo's label
	public get label(){
		// Trap the error on deletion
		if ( this.deleted ){
			return '';
		}
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		return this.todo.attributes.label;
	}

	// # List element class flags
	public isEditing = false;
	public isHovered = false;

	// # Component's DOM references. 
	// Keep a reference to the `editedLabel` input that will be focused on edit
	public $refs!: {
		labelEdit: HTMLInputElement;
	};


	// # ToDo edition
	
	// ## `finished` toggling
	// Those are just handy shorthands to get/set the ToDo property, and persist it if required
	public get finished(){
		// Trap the error on deletion
		if ( this.deleted ){
			return true;
		}
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

	// ## Label edition
	// v-model property that contains the temporary label while editing
	private editedLabel = '';

	// When starting the edition, set the `isEditing` status to `true` and
	// set the input value with the current ToDo's label
	public startEdit(){
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		this.isEditing = true;
		this.editedLabel = this.todo.attributes.label;
		// Defer to next tick, to let vuejs update the class
		// and display the input before focusing the input
		setTimeout( () => this.$refs.labelEdit.focus(), 0 );
	}

	// Exit the edit mode, set the ToDo label with the edited one & persist the entity in data store
	public async saveEdit(){
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		this.isEditing = false;

		const editedLabel = this.editedLabel.trim();
		if ( editedLabel === '' ){
			// The label is empty: remove the ToDo
			await this.removeTodo();
		} else {
			// The label is changed: persist the ToDo
			this.todo.attributes.label = editedLabel;
			await this.todo.persist();
		}
	}
	
	// Exit the edit mode & reset the input value
	public discardEdit(){
		if ( !this.todo.attributes ){
			throw new Error( 'Entity is in invalid state' );
		}
		this.isEditing = false;
		this.editedLabel = this.todo.attributes.label;
	}


	// # ToDo removal
	public async removeTodo(){
		this.deleted = true;
		await this.todo.destroy();
		// Search results are changed: ask the app to refresh searches
		this.$emit( 'refresh' );
	}
}
</script>
