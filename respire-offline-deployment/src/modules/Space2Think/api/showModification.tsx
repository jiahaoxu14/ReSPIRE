import {
	GPT4CompletionResponse,
	GPT4Message,
	MessageContent,
	fetchFromOpenAi,
} from './fetchFromOpenAi.tsx'
 
import {
    $getRoot, 
    $getSelection, 
    $createParagraphNode, 
    $createTextNode, 
    $createLineBreakNode, 
    // $createCodeHighlightNode,
} from 'lexical';
import { diffLines } from 'diff';


const systemPrompt = `
I'll give you JSON data of v1 and v2. You need to compare how v2 version updates based on v1 version and return output in the expected JSON form. You must list the changes that newly added to v2 compared with v1. Do not show me how to implement, I just need the result.
`

const assistantPrompt = `
Output in this JSON form.
Diffs should be a list, find the diff in each sub sentences splitted by ",", please split the diffs in list
{
    "Introduction":
        {
            "type": ""("modification"/"addition"/"deletion"),
            "updated text": ""(updated text part in updated version",
        },
    "": {},
    ...
}
`
// const userPrompt = ""

export async function showModifications (oriReport1, oriReport2) {
    
    let reports = {}
    const tmp1 = JSON.parse(oriReport1);
    let report1 = {}, report2 ={};
    for (var item in tmp1){
        if (item == "Introduction" || item == "Conclusion"){
            report1[item] = tmp1[item];
        }
        else {
            for (var i in tmp1[item]){
                report1[tmp1[item][i]["id"]] = tmp1[item][i]["text"];
            }
        }
    }

    const tmp2 = JSON.parse(oriReport2);
    for (var item in tmp2){
        if (item == "Introduction" || item == "Conclusion"){
            report2[item] = tmp2[item];
        }
        else {
            for (var i in tmp2[item]){
                report2[tmp2[item][i]["id"]] = tmp2[item][i]["text"];
            }
        }
    }
    console.log("[showModification] report1", report1);
    console.log("[showModification] report2", report2);

    let index = 0;
    let addedFrame = [];
    for (var item in report2){
        console.log("[showModification] modification item", item);
        if (!report1.hasOwnProperty(item)){
            addedFrame.push(index); //need to be sent to plugin
        }else{
            reports[item] = {}
            reports[item]["v1"] = report1[item];
            reports[item]["v2"] = report2[item];
        }
        index += 1;
    }

    console.log("[showModification] reports", reports);   
    
    const userPrompt = JSON.stringify(reports, null, "\t");

    const input_prompt = await buildPromptForOpenAi(userPrompt);
	console.log("[showModification] modification_prompt: ", input_prompt)
    let response = "";

    for (var i in reports){
        const diff = diffLines(reports[i]["v1"], reports[i]["v2"]);
        console.log("[showModification] diff", diff);
    }
    try {
		// If you're using the API key input, we preference the key from there.
		// It's okay if this is undefined—it will just mean that we'll use the
		// one in the .env file instead.
		// const apiKeyFromDangerousApiKeyInput = (
       //      //      document.body.querySelector('#openai_key_risky_but_cool') as HTMLInputElement
       //      // )?.value
       const apiKeyFromDangerousApiKeyInput = "<Your OpenAI API Key Here>";

		// make a request to openai. `fetchFromOpenAi` is a next.js server action,
		// so our api key is hidden.
		const openAiResponse = await fetchFromOpenAi(apiKeyFromDangerousApiKeyInput, {
			model: 'gpt-4-1106-preview',
			response_format: { type: 'json_object' },
			max_tokens: 1500,
			temperature: 0,
			messages: input_prompt,
		})

		if (openAiResponse.error) {
			throw new Error(openAiResponse.error.message)
		}

		response = openAiResponse.choices[0].message.content

		console.log('openAiResponse: ', response)

		return response;
	} catch (e) {
		throw e
	}

    
}

async function buildPromptForOpenAi (content): Promise<GPT4Message[]> {

	// the user messages describe what the user has done and what they want to do next. they'll get
	// combined with the system prompt to tell gpt-4 what we'd like it to do.
	const userMessages: MessageContent = [
		{
			type: 'text',
			text: content,
		}
	]

	// combine the user prompt with the system prompt
	return [
		{ role: 'system', content: systemPrompt},
		{ role: 'user', content: userMessages},
		{ role: 'assistant', content: assistantPrompt},
	]
}
