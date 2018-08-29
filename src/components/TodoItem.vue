<template>
	<li>
		<div class="view">
			<input class="toggle" type="checkbox" />
			<label>_</label>
			<button class="destroy"></button>
		</div>
		<input class="edit" />
	</li>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class TodoItemComponent extends Vue {
}
</script>
