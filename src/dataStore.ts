import { Diaspora } from '@diaspora/diaspora';

// Initialize the data source
Diaspora.createNamedDataSource( 'main', 'inMemory' );

// Interface describing the attributes of a ToDo item.
// Because the ID is a property of the Entity, we don't declare it here.
export interface ITodo{
	label: string;
	finished: boolean;
}
