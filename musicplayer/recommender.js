const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function recommendFolder(area, activity) {

    const prompt = `
You are selecting music for a university student.

Current area:
${area}

Current activity:
${activity}

Available music folders:

- Bus Waiting
- Cafeteria
- Classroom/Resting
- Classroom/Running
- Classroom/Walking
- Exercise/Gym
- Exercise/Resting
- Exercise/Running
- Exercise/Walking
- General/Resting
- General/Resting(Night)
- General/Running
- General/Walking
- General/Walking(Night)
- H Village Vibe
- Komoike
- Library Music
- Research (Delta)
- SFC Office

Reply ONLY with the folder name.
`;

    const response = await client.responses.create({

        model: "gpt-4.1-mini",

        input: prompt

    });

    return response.output_text.trim();

}

module.exports = {
    recommendFolder
};