type Item = { id: number; name: string; code: string; picture: string | null; price: number; user_has?: boolean };

type Prize = { id: number; name: string; code: string; picture: string | null; price: number };

type ItemResponse = DatabaseResponse & {
	item?: Item;
};

type ItemsResponse = DatabaseResponse & {
	items?: Item[];
	pages?: number;
};

type PrizeResponse = DatabaseResponse & {
	items?: Prize[];
	pages?: number;
};

type ItemsFilter = {
	filter:
		| "sorting_a_z"
		| "sorting_z_a"
		| "sorting_cost_low"
		| "sorting_cost_high"
		| "sorting_long_ago"
		| "sorting_latest";
	items_on_page: number;
};
