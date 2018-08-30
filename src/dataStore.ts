import { Diaspora, EFieldType } from '@diaspora/diaspora';

// Initialize the data source
Diaspora.createNamedDataSource( 'main', 'inMemory' );

// Interface describing the attributes of a ToDo item.
// Because the ID is a property of the Entity, we don't declare it here.
export interface ITodo{
	label: string;
	finished: boolean;
}

// Define & export the Model
export const ToDos = Diaspora.declareModel<ITodo>( 'ToDos', {
	sources: 'main',
	attributes: {
		label: {
			type: EFieldType.STRING,
			required: true,
		},
		finished: {
			type: EFieldType.BOOLEAN,
			default: false,
		},
	},
} );
