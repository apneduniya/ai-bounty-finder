import readline from "readline";
import { openai } from "@ai-sdk/openai";
import { streamText, type CoreMessage } from "ai";
import { App, VercelAIToolkit } from "vity-toolkit";
import { configDotenv } from "dotenv";


configDotenv();

const toolKit = new VercelAIToolkit();
const messages: CoreMessage[] = []

// define the apps you want to use
const tools = toolKit.getTools({ apps: [App.EARN, App.GIBWORK] });


const bot = async (prompt: string) => {
    try {

        messages.push({
            role: "user",
            content: prompt,
        })

        const result = streamText({
            model: openai("gpt-4o"),
            tools,
            maxSteps: 10,
            system: `Your name is Vity Bounty Finder. You have been made by Vity Toolkit. You are an AI agent responsible for taking actions on Superteam Earn and Gibwork on users' behalf. You need to take action on using their APIs. Use correct tools to run APIs from the given toolkit. Give them the bounties/grants/projects if it comes under there background or interest. Your response should be structured and look beatiful too as it will directly be shown to the user. Be concise and helpful with your responses.

            Note:
            - When you are giving links for bounties for Superteam Earn, make sure the link has: https://earn.superteam.fun/listings/bounty/*
            Usually it will not have '/bounty' slug but add it manually.
            `,
            messages,
        })

        let response = "";

        for await (const message of result.textStream) {
            console.clear();
            response += message;
            console.log("\nVity Bounty Finder: ", response);
        }

        const responseMessages = (await result.response).messages;
        responseMessages.forEach((msg: CoreMessage) => messages.push(msg));

    } catch (error) {
        throw error;
    }
}


const run = async () => {
    console.clear();

    console.log(`
    +----------------------------------------------+
    |          Welcome to Bounty Finder !          |
    +----------------------------------------------+
    `);

    try {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const q = (prompt: string): Promise<string> =>
            new Promise((resolve) => rl.question(prompt, resolve));

        const userPrompt = (await q("What are your interests?\n> ")).trim();
        rl.close();
        await bot(userPrompt);

        while (true) {
            const rl2 = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const q2 = (prompt: string): Promise<string> =>
                new Promise((resolve) => rl2.question(prompt, resolve));

            const userPrompt = (await q2("\nAnything else?\n> ")).trim();
            rl2.close();

            await bot(userPrompt);
        }

    } catch (error) {
        console.error("Failed to run the agent:", error);
        throw error;
    }

}

if (require.main === module) {
    run().catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

