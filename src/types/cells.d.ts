type CellsResponse = DatabaseResponse & {
	n?: number;
	cells?: Cell[];
};

type CellResponse = DatabaseResponse & {
	cell?: Cell;
};

type Cell = {
	id: number;
	event: number;
	coord_x: number;
	coord_y: number;
	item: number | null;
	is_used: boolean;
	code: string | null;
};
