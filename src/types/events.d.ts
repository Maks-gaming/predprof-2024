type Field = {
	id?: number;
	name?: string;
	n?: number;
	owner?: number;
};

type EventResponse = DatabaseResponse & {
	event?: Field;
};

type AmmoRespone = DatabaseResponse & {
	ammo?: {
		all: number;
		left: number;
	};
};

type GameEvent = { id: number; name: string; n: number };
type UserFields = { id: number; name: string; url: string; prizes: number };
type UserFieldsResponse = DatabaseResponse & {
	user_field?: UserFields[];
};

type EventUser = { event: number; user: number; count: number };

type EventUserAmmo = { name: string; id: number; all: number; left: number };

type EventUserResponse = DatabaseResponse & {
	event_user?: EventUser;
};

type EventUserAmmoResponse = DatabaseResponse & {
	users?: EventUserAmmo[];
};
