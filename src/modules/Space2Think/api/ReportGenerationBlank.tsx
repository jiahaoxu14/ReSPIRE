import {
	GPT4CompletionResponse,
	GPT4Message,
	MessageContent,
	fetchFromOpenAi,
} from './fetchFromOpenAi.tsx'

import { $getSelection } from 'lexical'; 
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { useEffect, Dispatch, useState} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import { setReport } from '../../LexicalEditor/slices/EditorSlice'
import { current } from '../../LexicalEditor/time.js';

let systemPromptBlank = `<Task Description> I want you to output a report after clustering those documents.

I will provide all documents with indexes in the task in the user message. Also, I may have some human interaction information at the end of user message. Please cluster those documents first and write a summarization report of the clusters rather than listing points.
`

let assistantPromptBlank = `The returned JSON objects should follow this format:
{
    “Introduction”: “<Introduction>”,
    “Middle_paragraph”: [
        {
            “id”: "",
			"files": "The list of labels of which the documents belong this cluster"
            "name":“summarize the content as the new cluster name.”,
			“summarization”: "summarize this cluster consist of documents",
            “text”: “<ClusterDescription>. DON't include citations here.”,
            “name entities”: "list important entities in 'text' with document id as citation, like 'name [document1 id, document2 id]'.",
            “keywords”: "list important keywords you found in the input JSON cluster with document id as citation, like 'keyword[document1 id, document2 id]'",
        },
        {
            ...
        }
    ],
    “Conclusion”: “<Conclusion>”,
}

Note you should use cluster and node id provided to you in the input JSON object.

`
// add "\n" after each prompt

//hard code ChatGPT API here, if you publicize the code, you need to remove it
// process.env.OPENAI_API_KEY="<Your OpenAI API Key Here>"
// still need text prompt and interaction prompt

export async function reportGenerationBlank (snapshot, taskP, introP, clusterP, conclusionP) {
	const stringified = JSON.stringify(snapshot);
	const jsondata = JSON.parse(stringified);
	const data = jsondata.store;
	console.log(`[${current()}]`+ "[ReplortGenerationBlank] jsondata", data);

	var dict = {}
	var highlight = {}
	
	for (const key in data) {
		if (data[key]["type"] === "xx_html") {
			dict[data[key].props.label] = {
				content: data[key].props.content, 
				highlight: data[key].props.highlight,
			}
		}
	}

	console.log(`[${current()}]`+ "[ReplortGenerationBlank] dict", dict);

	// cluster info
	for (const key in dict){
		if (dict[key].highlight.length===0){
			continue;
		}
		let hl = dict[key].highlight;

		for (const n in hl){
			const word = hl[n];
			if (word in highlight){
				highlight[word] += 1;
			} else {
				highlight[word] = 1;
			}
		}
	}
	console.log(`[${current()}]`+ "[ReplortGenerationBlank] highlight", highlight);

	// document and cluster prompt according to their orders
	const doc_prompt = "Here are the documents: \n\n"
	const doc = JSON.stringify(dict, null, "\t");

	// interaction info

	// 1a) highlight
	// current: highlight with weights, weights are the number of times the word is highlighted
	let hl_prompt = "";
	if (Object.keys(highlight).length !== 0){
		const hl_prompt1 = `I have some word weights of important words. You must add the details of those words in the report:`
		const hl_prompt2 = JSON.stringify(highlight, null, "\t");
		hl_prompt = hl_prompt1 + "\n" + hl_prompt2;	}
	else {
		hl_prompt = ""
	}

	// final prompt
	const interaction_prompt = hl_prompt;
	// console.log("UserPrompt: ", prompt);

	
	

	// replace the prompt with the newest one
	systemPromptBlank = systemPromptBlank.replace("<Task Description>", taskP);
	assistantPromptBlank = assistantPromptBlank.replace("<Introduction>", introP).replace("<ClusterDescription>", clusterP).replace("<Conclusion>", conclusionP);

	const input_prompt = await buildPromptForOpenAiBlank(doc_prompt+doc, interaction_prompt);
	// console.log(`[${current()}]`+ "[ReplortGenerationBlank] input_prompt: ", input_prompt)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt systemPrompt: ", systemPromptBlank)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt assistantPrompt: ", assistantPromptBlank)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt: docPrompt", doc_prompt+doc)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt: interactionPrompt", interaction_prompt)

	try {
		// If you're using the API key input, we preference the key from there.
		// It's okay if this is undefined—it will just mean that we'll use the
		// one in the .env file instead.
		const apiKeyFromDangerousApiKeyInput = (
                 document.body.querySelector('#openai_key_risky_but_cool') as HTMLInputElement
            )?.value
    //    const apiKeyFromDangerousApiKeyInput = "<Your OpenAI API Key Here>";

		// make a request to openai. `fetchFromOpenAi` is a next.js server action,
		// so our api key is hidden.
		const openAiResponse = await fetchFromOpenAi(apiKeyFromDangerousApiKeyInput, {
			model: 'gpt-4o',
			response_format: { type: 'json_object' },
			max_tokens: 3000,
			temperature: 0,
			messages: input_prompt,
		})

		if (openAiResponse.error) {
			throw new Error(openAiResponse.error.message)
		}

		const response = openAiResponse.choices[0].message.content

		console.log(`[${current()}]`+ '[ReplortGenerationBlank] openAiResponse: ', response)

		return response;
	} catch (e) {
		throw e
	}

}

async function buildPromptForOpenAiBlank (content, interaction_prompt): Promise<GPT4Message[]> {

	// the user messages describe what the user has done and what they want to do next. they'll get
	// combined with the system prompt to tell gpt-4 what we'd like it to do.
	const userMessages: MessageContent = [
		{
			type: 'text',
			text: content,
		},
		{
			type: 'text',
			text: interaction_prompt,
		}
	]

	// combine the user prompt with the system prompt
	return [
		{ role: 'system', content: systemPromptBlank},
		{ role: 'user', content: userMessages},
		{ role: 'assistant', content: assistantPromptBlank},
	]
}
