import OpenAI from 'openai';

const openai = new OpenAI();

export function extractJsonFromResponse (string: string) {
	const match = string.match(/```json\n([\s\S]*?)\n```/);
	const jsonString = match ? match[1] : string;

	try{
		return JSON.parse(jsonString);
	}catch(e){
		console.error(`Error parsing JSON from response: ${e}`);
		return null;
	}
}

export default class ChatGptHelper {
	static async sendText (model : OpenAI.Chat.ChatModel = 'gpt-5-nano', content: string, reasoning_effort : 'minimal' | 'low' | 'medium' | 'high' = 'low') {
        const completion = await openai.chat.completions.create({
			model,
			messages: [
				{ role: 'user', content }
			],
			reasoning_effort: reasoning_effort
		});

        console.log(`🤖 Response from ChatGPT: ${completion.choices[0].message.content}`);
		return completion.choices[0].message.content;
	}
}
