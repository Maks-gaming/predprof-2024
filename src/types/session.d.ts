import session from "express-session";
import { User } from "../database";

declare module "express-session" {
	export interface SessionData {
		user: User;
	}
}
