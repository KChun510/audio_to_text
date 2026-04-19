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
		const third_half = `${file_name}_part3.mp3`;

		let audio_file_names: string[] = [];
		let audio_file_times: number[] = [];
		let text_file_parts: string[] = []; 
		let audio_part_num = 0;
		const max_audio_len = 1800;

		// Get duration using ffprobe
		let duration = parseFloat(
			execSync(
				`ffprobe -i "${file_path}" -show_entries format=duration -v quiet -of csv="p=0"`
			).toString()
		);

		if (duration / 2 < max_audio_len) { // Case where even split, its greater than 30 mins
			audio_file_names.push(`${file_name}_part${audio_part_num}.mp3`);
			audio_file_times.push(duration / 2)
			audio_part_num++;
			audio_file_names.push(`${file_name}_part${audio_part_num}.mp3`);
			audio_file_times.push(duration / 2)
		} else { // Dynamic parting
			while(duration > 0){
				(duration - max_audio_len < 0) ? audio_file_times.push(duration) : audio_file_times.push(max_audio_len);
				audio_file_names.push(`${file_name}_part${audio_part_num}.mp3`);
				duration -= max_audio_len;
				audio_part_num++;
			}
		}

		console.log(`Splitting file into: ${audio_file_times.length} segments.`);
		let file_names_copy = [...audio_file_names];
		let file_times_copy = [...audio_file_times];
		let start_time = 0; 
		audio_part_number = 0;

		while(file_names_copy.length > 0  && file_times_copy.length > 0){
			const part_time = file_times_copy.pop();
			const part_name = file_names_copy.pop();
			execSync(
				`ffmpeg -y -i "${file_path}" -ss ${start_time} -t ${part_time} -c copy "${part_name}"`
			);

			start_time += part_time;
		}; 

		file_names_copy = [...audio_file_names];

		while(file_names_copy.length > 0){
			console.log(`Trascribing part: ${audio_part_number}`);
			const file_part = await config.openai.audio.transcriptions.create({
				file: fs.createReadStream(file_names_copy.pop()),
				model: "whisper-1",
				response_format: "text",
			});
			console.log(file_part)
			text_file_parts.push(file_part);
			audio_part_number++;
		};
		
		const combined = text_file_parts.join(`\n`);

		fs.writeFileSync(`${output_dir}${file_name}.txt`, combined, "utf-8");

		console.log(`Text output to: ${output_dir}${file_name}.txt`);

		while(audio_file_names.length > 0){
			fs.unlinkSync(audio_file_names.pop());
		}

		console.log("Temporary split files deleted.");

		process.exit(0);
	} catch (e) {
		console.error(`\n\n${e}`);
		process.exit(1);
	}
})();

