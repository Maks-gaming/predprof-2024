type EventResponse = DatabaseResponse & {
	event?: Event;
};

type AmmoRespone = DatabaseResponse & {
	ammo?: {
		all: number;
		left: number;
	};
};

type GameEvent = { id: number; name: string; n: number };
type UserFields = { name: string; url: string; prizes: number };
type UserFieldsResponse = DatabaseResponse & {
	user_field?: UserFields[];
};

type EventUser = { event: number; user: number; count: number };

type EventUserResponse = DatabaseResponse & {
	event_user?: EventUser;
};
