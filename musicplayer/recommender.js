const OpenAI = require("openai");

console.log("Loaded recommender.js");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function recommendFolder(area, activity) {

    console.log("recommendFolder called");
    const prompt = `
You are selecting music for a university student.

Current campus location:
${area}

Current activity:
${activity}

The campus locations correspond to music folders as follows:

H Village Vibe -> H Village Vibe
Gym -> Exercise/Gym
Media -> Research (Delta)
Bus1 -> Bus Waiting
Bus2 -> Bus Waiting
Subwway -> General
Sigma -> Research (Delta)
AlphaOmega -> Classroom
Cabins -> General
Tennis -> Exercise
Kappa1 -> Classroom
Kappa2 -> Classroom
Epsilon1 -> Classroom
Epsilon2 -> Classroom
Iota1 -> Classroom
Iota2 -> Classroom
Omnicron -> Classroom
Omnicron2 -> Classroom
Lambda -> Classroom
Theta -> Classroom
Shrine -> General
SBC -> SFC Office
TauDelta -> Classroom
Pond -> Komoike

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

Rules:
- If the user is in a classroom-related location, choose one of the Classroom folders depending on activity.
- If the user is at the gym, choose one of the Exercise folders.
- If the user is at a bus stop, choose Bus Waiting.
- If the user is at the pond, choose Komoike.
- If the user is in Media or Sigma, choose Research (Delta).
- If the activity is resting, prefer Resting folders.
- If the activity is walking, prefer Walking folders.
- If the activity is running, prefer Running folders.
- If the activity is exercise and the location is Gym, choose Exercise/Gym.

Reply ONLY with one folder name from the list above.
`;

    const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt
    });

    console.log("OpenAI replied:", response.output_text);

    return response.output_text.trim();
}

module.exports = {
    recommendFolder
};