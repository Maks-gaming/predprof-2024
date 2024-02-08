type User = {
	id: number;
	name: string;
	hash_pass: string;
	photo: string | null;
	is_admin: boolean;
	email: string;
};

type UserResponse = DatabaseResponse & {
	user?: User;
};

type UsersResponse = DatabaseResponse & {
	users?: User[];
};
