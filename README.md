# Audio Context Extractor

Simple CLI tool to process audio files and pass context into LLM workflows.

Originally built to break down long audio into usable chunks for general education tasks, but can be extended into larger pipelines.

---

## Setup

Install dependencies:

```bash
npm install
````

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_api_key_here
```

Get your API key from: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## Usage

The script takes a file path as an argument:

```bash
npx tsx main.ts "path/to/audio.mp3"
```

### Example

```bash
npx tsx main.ts "./lecture.mp3"
```

---

## Notes

* Accepts `.mp3` files as input
* Built to feed audio context into LLM pipelines
* Can be extended for transcription, summarization, or chunking

---

## ⚠️ Requirements

Make sure `ffmpeg` is installed:

```bash
ffmpeg -version
```

If not installed:

**macOS (brew):**

```bash
brew install ffmpeg
```

**Ubuntu:**

```bash
sudo apt install ffmpeg
```

**Windows (choco):**

```bash
choco install ffmpeg
```
