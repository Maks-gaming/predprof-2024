import crypto from "crypto";

export default class Encryption {
	static generateCode(length: number) {
		let result: string = "";
		const characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength: number = characters.length;
		let counter: number = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	}

	static hashPassword(password: string): string {
		const firstHash = crypto.createHash("md5").update(password).digest("hex");
		const secondHash = crypto.createHash("md5").update(firstHash).digest("hex");
		return secondHash;
	}
}
