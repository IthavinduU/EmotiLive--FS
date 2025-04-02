import { exec } from "child_process";

export async function GET() {
    const scriptPath = "D:\\University\\IIT\\Level 7\\Final Year Project\\MVP\\EmotiLive\\Fullstack\\models\\emotion_model\\main.py";

    return new Promise((resolve) => {
        exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                resolve(new Response(JSON.stringify({ error: error.message }), { status: 500 }));
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                resolve(new Response(JSON.stringify({ error: stderr }), { status: 500 }));
                return;
            }
            console.log(`Output: ${stdout}`);
            resolve(new Response(JSON.stringify({ message: "Emotion model executed", output: stdout }), { status: 200 }));
        });
    });
}
