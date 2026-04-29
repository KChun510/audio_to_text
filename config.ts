import { OpenAI } from "openai"
import dotenv from "dotenv";

dotenv.config();

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export enum avail_os {
	Windows = 'win32',
	Linux = 'linux'
};

export const id_os : Record<string, avail_os> = {
	win32: avail_os.Windows,
	linux: avail_os.Linux
};

export function what_os() : os {
	const chosen_os = id_os[process.platform];
	if(!chosen_os) throw new Error(`Unsorpted platform: ${process.platform}`);
	return chosen_os;
}

export function return_file_name_from_path(file_path: string): string[] {
	const rm_spaces = file_path.split(" ").join("");
	switch(what_os()){
		case avail_os.Windows:
			const temp_split = rm_spaces.split("\\");
			return 	temp_split[temp_split.length - 1].split(".")[0];
		case avail_os.Linux:
			const temp_spilt = rm_spaces.split("/");
			return temp_split[temp_split.length - 1].split(".")[0];
		default:
			throw new Error("Non-Compatible System.");
	}
}

