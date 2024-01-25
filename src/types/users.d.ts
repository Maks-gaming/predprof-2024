type User = {
	id: number;
	name: string;
	email: string;
	hash_pass: string;
	photo: string | null;
	is_admin: boolean;
};

type UserResponse = DatabaseResponse & {
	user?: User;
};

type UsersResponse = DatabaseResponse & {
	users?: User[];
};
