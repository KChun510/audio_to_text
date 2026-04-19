import * as fs from "fs";
import { execSync } from "child_process";
import * as config from "./config";

function return_file_name_from_path(file_path: string): string[] {
	const rm_spaces = file_path.split(" ").join("");
	switch(config.what_os()){
		case config.avail_os.Windows:
			const temp_split = rm_spaces.split("\\");
			return 	temp_split[temp_split.length - 1].split(".")[0];
		case config.avail_os.Linux:
			const temp_spilt = rm_spaces.split("/");
			return temp_split[temp_split.length - 1].split(".")[0];
		default:
			throw new Error("Non-Compatible System.");
	}
}

(async function main() {
	try {
		const file_path = process.argv[2];
		const output_dir = "./text_files/";

		if (!file_path || file_path == '' || !fs.existsSync(file_path)) {
			throw new Error(`File of: ${file_path} does not exist`);
		}

		console.log(`Processing your audio into text.....`)

		let file_name = return_file_name_from_path(file_path);
		const first_half = `${file_name}_part1.mp3`;
		const second_half = `${file_name}_part2.mp3`;

		// Get duration using ffprobe
		const duration = parseFloat(
			execSync(
				`ffprobe -i "${file_path}" -show_entries format=duration -v quiet -of csv="p=0"`
			).toString()
		);

		const half = duration / 2;

		console.log(`Splitting file at ${half.toFixed(2)} seconds...`);

		// Split first half
		execSync(
			`ffmpeg -y -i "${file_path}" -t ${half} -c copy "${first_half}"`
		);

		// Split second half
		execSync(
			`ffmpeg -y -i "${file_path}" -ss ${half} -c copy "${second_half}"`
		);

		console.log("Transcribing first half...");
		const t1 = await config.openai.audio.transcriptions.create({
			file: fs.createReadStream(first_half),
			model: "whisper-1",
			response_format: "text",
		});

		console.log("Transcribing second half...");
		const t2 = await config.openai.audio.transcriptions.create({
			file: fs.createReadStream(second_half),
			model: "whisper-1",
			response_format: "text",
		});

		const combined = `${t1}\n${t2}`;

		fs.writeFileSync(`${output_dir}${file_name}.txt`, combined, "utf-8");

		console.log(`Text output to: ${output_dir}${file_name}.txt`);

		// Cleanup temporary files
		fs.unlinkSync(first_half);
		fs.unlinkSync(second_half);

		console.log("Temporary split files deleted.");

		process.exit(0);
	} catch (e) {
		console.error(`\n\n${e}`);
		process.exit(1);
	}
})();

