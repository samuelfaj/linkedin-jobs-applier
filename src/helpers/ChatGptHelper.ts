import OpenAI from 'openai';

const openai = new OpenAI();

export default class ChatGptHelper {
	static async sendText (model : OpenAI.Chat.ChatModel = 'gpt-4o', content: string) {
        const completion = await openai.chat.completions.create({
			model,
			messages: [
				{ role: 'user', content }
			],
		});

        console.log(`🤖 Response from ChatGPT: ${completion.choices[0].message.content}`);
		return completion.choices[0].message.content;
	}
}
