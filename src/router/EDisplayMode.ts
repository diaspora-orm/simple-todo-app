// Display modes of the app. It is used to filter ToDos
export enum EDisplayMode{
	FINISHED = 1,
	UNFINISHED = 2,
	ALL = EDisplayMode.FINISHED & EDisplayMode.UNFINISHED,
}
