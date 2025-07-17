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

let systemPrompt = `<Task Description>

I will provide you with the clusters and documents in the first part of the user message, followed by some human interaction information at the end of the user message. Please write a summarization report of the clusters rather than listing points.
`

let assistantPrompt = `The returned JSON objects should follow this format:
{
    “Introduction”: “<Introduction>”,
    “Middle_paragraph”: [
        {
            “id”: "use the original cluster id",
            "name":“If the cluster's original name is 'Frame', must summarize the content as the new name. If not, use the original name”,
			“summarization”: "summarize this cluster consist of documents",
            “text”: “<ClusterDescription>”,
            “name entities”: "list important entities in 'text' with document id as citation, like 'name[document_id1, document_id2]'.",
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
process.env.OPENAI_API_KEY="<Your OpenAI API Key Here>"
// still need text prompt and interaction prompt


export async function reportGeneration (snapshot, taskP, introP, clusterP, conclusionP) {
	const stringified = JSON.stringify(snapshot);
	const jsondata = JSON.parse(stringified);
	const data = jsondata.store;

	var dict = {}
	var annotation = {};
	var cluster = {};
	var highlight = {};
	var arrow = {};
	var omit_hl = {};

	for (const key in data) {
		if (data[key].id.includes("shape")) {
			if (data[key]["type"] === "frame") {
				dict[data[key].id] = 
				{
					name: data[key].props.name, 
					text: {},
					x: data[key].props.x,
					y: data[key].props.y,
				};
			}
			
			if (data[key]["type"] === "note" && data[key].parentId !== "page:page") {
				annotation[data[key].id] = {
					text: data[key].props.text,
					parent: {
						id: data[key].parentId,
						name: data[data[key].parentId].props.name,
						type: data[data[key].parentId].type
					},
					connect: ""
				};
			}

			if (data[key]["type"] === "arrow") {
				if (data[key].props.start.boundShapeId !== undefined && data[key].props.end.boundShapeId != undefined){
					arrow[data[key].props.start.boundShapeId] = 
					{
						id: data[key].props.end.boundShapeId,
						type: data[data[key].props.end.boundShapeId].type,
					};

					arrow[data[key].props.end.boundShapeId] = 
					{
						id: data[key].props.start.boundShapeId,
						type: data[data[key].props.start.boundShapeId].type,
					};
				}
			}
		}
	}
	
	for (const key in data) {
		if (data[key]["type"] === "xx_html") {
			if(data[key].parentId in dict) {
				dict[data[key].parentId].text[data[key].id] = {
					content: data[key].props.content, 
					label: data[key].props.label,
					highlight: data[key].props.highlight,
					commonhl: data[key].props.commonhl,
					omithl: data[key].props.omithl,
					
				}
			}
		}
	}

	for (const key in arrow){
		if (key in annotation){
			annotation[key].connect = arrow[key].id;
			annotation[key].connectType = arrow[key].type;
		}
	}

	console.log(`[${current()}]`+ "[ReportGeneration] dict", dict);

	
	function sort_object(obj) {
		const items = Object.keys(obj).map(function(key) {
			return [key, obj[key]];
		});
		items.sort(function(first, second) {
			if (second[3] === first[3]) {
				return second[2] - first[2]; // Secondary sort by y in descending order
			}
			return second[3] - first[3];
		});
		const sorted_obj={}
		items.forEach((v) => {
			const use_key = v[0];
			const use_value = v[1];
			sorted_obj[use_key] = use_value;
		});
		return(sorted_obj)
	} 

	const sorted_dict = sort_object(dict);
	console.log(`[${current()}]`+ "[ReportGeneration] sorted_dict", sorted_dict);

	// cluster info
	for (const key in sorted_dict){
		cluster[key] = {};
		cluster[key].name = sorted_dict[key].name;
		// console.log("sorted_dict[key].name", sorted_dict[key].name)
		cluster[key].member = {};
		for (const id in sorted_dict[key].text){
			cluster[key].member[sorted_dict[key].text[id].label] = sorted_dict[key].text[id].content;
			
			//highlight
			if (sorted_dict[key].text[id].highlight.length===0 && sorted_dict[key].text[id].commonhl.length===0 && sorted_dict[key].text[id].omithl.length===0){
				continue;
			}
			let hl = sorted_dict[key].text[id].highlight;
			const omithl = sorted_dict[key].text[id].omithl;
			if(sorted_dict[key].text[id].commonhl!==undefined){
				hl = hl.concat(sorted_dict[key].text[id].commonhl);
			}

			for (const n in hl){
				const word = hl[n];
				if (word in highlight){
					highlight[word] += 1;
				} else {
					highlight[word] = 1;
				}
			}

			for (const n in omithl){
				const word = omithl[n];
				if (word in omit_hl){
					omit_hl[word] += 1;
				} else {
					omit_hl[word] = 1;
				}
			}
		}
		
	}
	console.log(`[${current()}]`+ "[ReportGeneration] highlight", highlight);
	console.log(`[${current()}]`+ "[ReportGeneration] omit_hl", omit_hl);

	// document and cluster prompt according to their orders
	const doc_prompt = "Here are the document clusters and their contents: \n\n"
	const doc = JSON.stringify(cluster, null, "\t");

	// interaction info

	// 1a) highlight
	// current: highlight with weights, weights are the number of times the word is highlighted
	let hl_prompt;
	if (Object.keys(highlight).length !== 0){
		const hl_prompt1 = `I have some word weights of important words. You must add the details of those words in the report:`
		const hl_prompt2 = JSON.stringify(highlight, null, "\t");
		hl_prompt = hl_prompt1 + "\n" + hl_prompt2;	}
	else {
		hl_prompt = ""
	}

	// 1b) negative highlight
	let nega_hl_prompt = "";
	if (Object.keys(omit_hl).length !== 0){
		const nega_hl_prompt1 = `I have some word weights of unimportant words. You must avoid using those words in the report:`
		const nega_hl_prompt2 = JSON.stringify(omit_hl, null, "\t");
		nega_hl_prompt = nega_hl_prompt1 + "\n" + nega_hl_prompt2;
	}
	else {
		nega_hl_prompt = ""
	}

	// 2) annotation
	const annot = {
		cluster: {},
		node: {},
	}
	for (const key in annotation){
		if (annotation[key].connect !== "" && annotation[key].connectType === "xx_html"){
			annotation[key].directConnect = {
				id: annotation[key].connect,
				type: annotation[key].connectType,
			}
		}
		else {
			annotation[key].directConnect = {
				id: annotation[key].parent.id,
				type: annotation[key].parent.type,
			}
		}
		if (annotation[key].directConnect.type ==="xx_html"){
			const id = annotation[key].directConnect.id;
			// console.log("xuxinid", data[id].id);
			annot.node[data[id].props.label] = annotation[key].text;
		}
		else if (annotation[key].directConnect.type ==="frame"){
			const id = annotation[key].directConnect.id;
			annot.cluster[data[id].id] = annotation[key].text;
		}
	}

	const annot_prompt1 = `I have annotations tied with nodes. You must generate the report according to the annotation information I input.
	Annotation information:
	`
	let annot_prompt2;
	if (Object.keys(annot.cluster).length !== 0 || Object.keys(annot.node).length !== 0){
		annot_prompt2 = annot_prompt1 + "\n" + JSON.stringify(annot, null, "\t");
	}else {
		annot_prompt2 = ""
	}

	// final prompt
	const interaction_prompt = hl_prompt + "\n" + "\n" + nega_hl_prompt + "\n" + "\n" + annot_prompt2;
	// console.log("UserPrompt: ", prompt);

	// replace the prompt with the newest one
	systemPrompt = systemPrompt.replace("<Task Description>", taskP);
	assistantPrompt = assistantPrompt.replace("<Introduction>", introP).replace("<ClusterDescription>", clusterP).replace("<Conclusion>", conclusionP);

	const input_prompt = await buildPromptForOpenAi(doc_prompt+doc, interaction_prompt);
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt systemPrompt: ", systemPrompt)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt assistantPrompt: ", assistantPrompt)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt: docPrompt", doc_prompt+doc)
	console.log(`[${current()}]`+ "[ReportGeneration] input_prompt: interactionPrompt", interaction_prompt)
	// console.log(`[${current()}]`+ "[ReportGeneration] input_prompt: ", input_prompt)

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
			model: 'gpt-4o-mini',
			response_format: { type: 'json_object' },
			max_tokens: 3000,
			temperature: 0,
			messages: input_prompt,
		})

		if (openAiResponse.error) {
			throw new Error(openAiResponse.error.message)
		}

		const response = openAiResponse.choices[0].message.content

		console.log(`[${current()}]`+ '[ReplortGeneration] openAiResponse: ', response)

		return response;
	} catch (e) {
		throw e
	}

}

async function buildPromptForOpenAi (content, interaction_prompt): Promise<GPT4Message[]> {

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
		{ role: 'system', content: systemPrompt},
		{ role: 'user', content: userMessages},
		{ role: 'assistant', content: assistantPrompt},
	]
}
