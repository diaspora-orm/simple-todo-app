import Vue from 'vue';
import Router from 'vue-router';

import { EDisplayMode } from './EDisplayMode';
import AppComponent from '../components/App.vue';

Vue.use( Router );

export default new Router( {
	routes: [
		{
			path: '/',
			name: 'index',
			component: AppComponent,
			props: { default: true, displayMode: EDisplayMode.ALL },
		},
		{
			path: '/completed',
			name: 'completed',
			component: AppComponent,
			props: { default: true, displayMode: EDisplayMode.FINISHED },
		},
		{
			path: '/active',
			name: 'active',
			component: AppComponent,
			props: { default: true, displayMode: EDisplayMode.UNFINISHED },
		},
	],
} );
