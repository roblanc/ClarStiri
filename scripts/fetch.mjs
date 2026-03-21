import { YoutubeTranscript } from 'youtube-transcript';
import fs from 'fs';

async function main() {
    try {
        console.log("Fetching transcript...");
        const transcript = await YoutubeTranscript.fetchTranscript('6knOlBGxrOE', { lang: 'ro' });
        const text = transcript.map(t => t.text).join(' ');
        fs.writeFileSync('transcript.txt', text);
        console.log('Transcript saved to transcript.txt. Length:', text.length);
    } catch (e) {
        console.error("Error fetching 'ro' transcript:", e.message);
        try {
            console.log("Attempting without language specification...");
            const transcript = await YoutubeTranscript.fetchTranscript('6knOlBGxrOE');
            const text = transcript.map(t => t.text).join(' ');
            fs.writeFileSync('transcript.txt', text);
            console.log('Transcript saved to transcript.txt. Length:', text.length);
        } catch (err) {
            console.error("Error fetching transcript:", err.message);
        }
    }
}
main();
