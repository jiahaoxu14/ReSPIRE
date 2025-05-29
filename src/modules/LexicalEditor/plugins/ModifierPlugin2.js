import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getRoot, 
    $getSelection, 
    $createParagraphNode, 
    $createTextNode, 
    $getNodes,
    $createLineBreakNode, 
    // $createCodeHighlightNode,
} from 'lexical';
import {
    setModifiedJson,
    setModifiedState,
    setunderLineNodeKeys,
  } from '../slices/EditorSlice.js'
import { $createHighlightDepNode } from '../nodes/HighlightDepNode.js'
import { $createTextBlockNode, $isTextBlockNode } from '../nodes/TextBlockNode.js'
import { current } from "../time.js";
const jsDiff = require('diff');

function getCitedText(text, citeKeywords){
    let citeIdx = [];
    let citeText = text.replace(/\s*\[[^\]]+\]/g, '');
    citeText = citeText.replace(/\(.*?\)/g, '');
    // console.log(`[${current()}]`+ "[ModifierPlugin] citeText1", citeText)
    for (let [keyword, citation] of Object.entries(citeKeywords)) {
        let regex = new RegExp(`\\b${keyword}s?\\b`);
        citeText = citeText.replace(regex,(match, offset) => {
            citeIdx.push([offset,citation.length + 1]);
    
            // Return the new word with the citation
            return `${keyword} ${citation}`
        });
        
    }
    // console.log(`[${current()}]`+ "[ModifierPlugin] citeIdx", citeIdx)
    // console.log(`[${current()}]`+ "[ModifierPlugin] citeText2", citeText)
    return [citeText, citeIdx];
}

function getModifiedText(idx, citeIdx, text){
    let modifiedList = []
    for (var j in idx){
        let position = idx[j];
        let newPosition = [position[0],position[1]];
        for (const cite in citeIdx) {
            if (citeIdx[cite][0] <= position[0]){
                newPosition[0] = newPosition[0] + citeIdx[cite][1];
                newPosition[1] = newPosition[1] + citeIdx[cite][1];
                const lastChar = text.slice(newPosition[0],newPosition[1])[newPosition[1]-newPosition[0]-1];
                if(lastChar === ' ' || lastChar === ',' || lastChar === '.' || lastChar === ';' || lastChar === ':'){
                    newPosition[1] = newPosition[1] - 1;
                    newPosition[0] = newPosition[0] - 1;
                }
            }
            // else if(citeIdx[cite][0] > newPosition[1]){
            //     break;
            // }
            // else if(citeIdx[cite][0] > position[0] && citeIdx[cite][0] <= position[1]){
            //     newPosition[0] = position[0];
            //     newPosition[1] = citeIdx[cite][0] - 1;
            //     modifiedList.push(newPosition);
            //     newPosition[0] = citeIdx[cite][1] + newPosition[0];
            // }
            // else if (citeIdx[cite][0] > newPosition[0] && citeIdx[cite][0] <= newPosition[1]){
            //     // newPosition[0] = position[0];
            //     newPosition[1] = citeIdx[cite][0] - 1;
            //     modifiedList.push(newPosition);
            //     newPosition[0] = citeIdx[cite][1] + newPosition[0];
            //     console.log("[ModifierPlugin] getModifiedText text middle", text.slice(newPosition[0],newPosition[1]))
            // }
            // else{
            //     modifiedList.push(position);
            //     console.log("[ModifierPlugin] getModifiedText text after", text.slice(newPosition[0],newPosition[1]))
            // }
        }
        modifiedList.push(newPosition);
        // console.log(`[${current()}]`+ "[ModifierPlugin] getModifiedText text before", text.slice(newPosition[0],newPosition[1]), position, newPosition)
    }
    return modifiedList
}
  
export default function ModifierPlugin() {
    const [editor] = useLexicalComposerContext();
    const dispatch = useDispatch();
    const generatedReport = useSelector(state => state.editor.report)
    const modifiedJson = useSelector(state => state.editor.modifiedJson)
    const modifiedState = useSelector(state => state.editor.ModifiedState)
    const allKeywords = useSelector(state => state.editor.keywords)
    const userKeyword = useSelector(state => state.editor.UserKeywords)
    const preReport = useSelector(state => state.editor.preReport)

    useEffect(() => {
        console.log(`[${current()}]`+ '[ModifierPlugin] modifiedState', modifiedState, "modified", modifiedJson.length)
        if (modifiedJson) {
            const jsonReport = JSON.parse(generatedReport);
            // const modifiedJson = JSON.parse(modified);
            // console.log(`[${current()}]`+ '[ModifierPlugin] modifiedJson', modifiedJson)
            // console.log(`[${current()}]`+ '[ModifierPlugin] jsonReport', jsonReport)
            // console.log('[ModifierPlugin] modified', modified)

            //keywords
            const citeKeywords1 = {}
            for (var item in allKeywords){
                for (var pair in allKeywords[item]){
                    citeKeywords1[pair] = '[' + allKeywords[item][pair].join(', ') + ']';
                }
            }

            const citeKeywords2 = {}
            let citationsDoc = [];
            for (var item in jsonReport["Middle_paragraph"]){
                citeKeywords2[jsonReport["Middle_paragraph"][item].id] = {}
                const citation = jsonReport["Middle_paragraph"][item]["keywords"].concat(", ").concat(jsonReport["Middle_paragraph"][item]["name entities"]);
                const text = jsonReport["Middle_paragraph"][item].text;
                let entries = []
                if (typeof citation === 'string'){
                    entries = citation.match(/[\w\s]+ ?\[[^\]]+\]/g);;
                }
                else{entries = citation;}
                // console.log("[Report Plugin] citation", citation)
                entries.forEach(entry => {
                    let match = entry.match(/^(.*?)\[(.*?)\]$/);
                    if (match){
                        const keyword = match[1].trim();
                        const ref = match[2].split(',').map(item => item.trim());
                        citeKeywords2[jsonReport["Middle_paragraph"][item].id][keyword] = "[" + ref.join(", ") + "]";
                        citationsDoc = citationsDoc.concat(ref);
                    }
                });
            }
            // console.log(`[${current()}]`+ "[ModifierPlugin] citeKeywords2", citeKeywords2)
            citationsDoc = citationsDoc.filter((item, index) => citationsDoc.indexOf(item) === index);
            // console.log(`[${current()}]`+ "[ModifierPlugin] citationsDoc", citationsDoc)

            //json report
            const paragraphs = [];
            // const modifiedIndex = [];
            const modifiedArray = [];
            const citeDict = {}; 
            let modifiedList = [];
            let modifiedText = {};

            for (var item in jsonReport){
                if (item === "Introduction" || item === "Conclusion"){
                    let [text, citeIdx] = getCitedText(jsonReport[item],citeKeywords1);
                    paragraphs.push(text);
                    // console.log(`[${current()}]`+ "[ModifierPlugin] paragraph text", text)
                    // console.log(`[${current()}]`+ '[ModifierPlugin] cluster name', item, 'citationsList', citeIdx);
                    modifiedList = getModifiedText(modifiedJson[item].index, citeIdx, text)
                    modifiedArray.push(modifiedList);

                }else{
                    const mp = jsonReport[item];
                    let j = 0;
                    for (var p in mp){
                        paragraphs.push(mp[p].name);
                        let [text, citeIdx] = getCitedText(mp[p].text,citeKeywords2[mp[p].id]);
                        // console.log(`[${current()}]`+ "[ModifierPlugin] paragraph text", text)
                        // console.log(`[${current()}]`+ '[ModifierPlugin] cluster name', mp[p].name, 'citationsList', citeIdx);
                        paragraphs.push(text);
                        modifiedList = getModifiedText(modifiedJson[mp[p].id].index, citeIdx, text)
                        modifiedArray.push(modifiedList);
                    }
                    
                }
            }
            
            
            // add the citation insertion here.
            // console.log(`[${current()}]`+ '[ModifierPlugin] paragraphs', paragraphs)

            
            let keywords = []
            for (var item in allKeywords["comKy"]){
                keywords.push(item)
            }
            for (var item in allKeywords["llmKy"]){
                keywords.push(item)
            }

            editor.update(() => {
                const root = $getRoot();
                if (!root.isEmpty()) {
                    const nodes = root.getChildren();
                    nodes.forEach(node => {
                        node.remove()
                    })
                }

                if (generatedReport !== '') {
                    const root = $getRoot();
                    
                    // Get the selection from the EditorState
                    const length = paragraphs.length - 1;

                    let underlineNode = [];
                    
                    let under = [];
                    for (var i in paragraphs){
                        const paragraph = paragraphs[i];

                        //section name
                        if ( (i != length) && (i % 2 === 1)){
                            const paragraphNode = $createParagraphNode();
                            const hlNode = $createHighlightDepNode('highlight-sec', paragraph+":");
                            hlNode.setStyle('color: #014591');
                            const textBlockNode = $createTextBlockNode()
                            textBlockNode.append(hlNode);
                            paragraphNode.append(textBlockNode);
                            root.append(paragraphNode);
                            continue;
                        }
                        // Create a new ParagraphNode
                        const paragraphNode = $createParagraphNode();

                        let chunks = [];
                        for (var j in keywords){
                            // console.log('paragraph', paragraph)
                            // let startIndex = 0;
                            const regex = new RegExp(`\\b${keywords[j]}\\b`,'g');
                            const matches = [...paragraph.matchAll(regex)];
                            const result = matches.map(match => match.index);
                            for (var k in result){
                                chunks.push(result[k]);
                                chunks.push(result[k] + keywords[j].length);
                            }
                        }

                        const pattern = /\[(.*?)\]/g;
                        const matches = [...paragraph.matchAll(pattern)];
                        // console.log(`[${current()}]`+ "[ModifierPlugin] matches", matches)

                        let results = {};
                        for (var j in matches){
                            let match = matches[j][0];
                            // let ref = match.slice(1, -1);
                            // console.log('[ModifierPlugin] match', match.slice(1,match.length-1))
                            const contents = match.slice(1,match.length-1).split(',').map(item => item.trim());
                            // console.log('[ModifierPlugin] contents', contents)
                            let startIndex = matches[j].index + 1;
                            for (var k in contents){
                                results[contents[k]] = {};
                                results[contents[k]].match = contents[k];
                                results[contents[k]].startIndex = startIndex;
                                results[contents[k]].endIndex = startIndex + contents[k].length;
                                chunks.push(startIndex);
                                chunks.push(startIndex + contents[k].length);
                                chunks = chunks.filter(function(idx) {
                                    return idx <= startIndex || idx >= startIndex + contents[k].length;
                                });
                                startIndex = startIndex + contents[k].length + 2;
                            }
                        }
                        // console.log(`[${current()}]`+ "[ModifierPlugin] results", results)

                        chunks.push(0);
                        chunks.push(paragraph.length);

                        const modifiedPart = [];
                        let index = 0;
                        if (i<paragraphs.length-1){
                            index = Math.floor(i / 2);
                        }else{
                            index = Math.floor(i / 2) + 1;
                        }
                        for (var j in modifiedArray[index]){
                            // console.log('modifiedArray[index][j]', modifiedArray[index][j])
                            // console.log('paragraph', paragraph)
                            // if (paragraph.includes(modifiedArray[index][j])){
                                // const idx = paragraph.indexOf(modifiedArray[index][j]);
                            modifiedPart.push([modifiedArray[index][j][0], modifiedArray[index][j][1]]);
                            chunks.push(modifiedArray[index][j][0]);
                            chunks.push(modifiedArray[index][j][1]);
                                // console.log("[ModifierPlugin] modifiedPart", paragraph.slice(idx,idx + modifiedArray[index][j].length));
                            // }
                        }
                        // console.log(`[${current()}]`+ "[ModifierPlugin] modifiedPart", modifiedPart);
                        

                        chunks.sort((a,b)=>a-b);
                        const uniquechunks = chunks.filter((item, index) => {
                            return chunks.indexOf(item) === index;
                        });
                        // console.log('uniquechunks', uniquechunks)

                        if(i == 0){
                            const textNode = $createTextNode("Summarization:");
                            textNode.setFormat('bold');
                            // textNode.setStyle('font-size: 120%');
                            // textNode.setStyle('font-family: Menlo;')
                            paragraphNode.append(textNode);
                            paragraphNode.append($createLineBreakNode());
                        }
                        else if(i==paragraphs.length-1){
                            const textNode = $createTextNode("Conclusion:");
                            textNode.setFormat('bold');
                            // textNode.setStyle('font-size: 120%');
                            // textNode.setStyle('font-family: Menlo;')
                            paragraphNode.append(textNode);
                            paragraphNode.append($createLineBreakNode());
                        }
                        else{
                            const textkNode = $createTextNode("        ")
                            paragraphNode.append(textkNode);
                        }

                        
                        // keywords coloring
                        for (let j = 0; j < uniquechunks.length - 1; j++){
                            const start = uniquechunks[j];
                            const end = uniquechunks[j + 1];
                            const textNode = $createTextNode(paragraph.slice(start, end));
                            const word = paragraph.slice(start, end);
                            
                            // console.log(`[${current()}]`+ '[ModifierPlugin] word', word)
                            if(keywords.includes(word)) {
                                if (userKeyword !== undefined){
                                    // console.log(`[${current()}]`+ "[ModifierPlugin]  Give colors to the keywords")
                                    // const hlNode = $createHighlightDepNode('highlight-word', word);
                                    let hlNode = $createHighlightDepNode('highlight-word', word);
                                    if (userKeyword["userKy"].includes(word)){
                                        hlNode = $createHighlightDepNode('combine-highlight-word', word);
                                    }else if (userKeyword["llmKy"].includes(word)){
                                        hlNode = $createHighlightDepNode('llm-highlight-word', word)
                                    }
                                    for (var k in modifiedPart){
                                        if (start >= modifiedPart[k][0] && end <= modifiedPart[k][1]){
                                            hlNode.setStyle('text-decoration: #f77c7c wavy underline');
                                            // console.log('hlNode', hlNode.getKey())
                                            under.push(hlNode.getKey());
                                            // underlineNode.push(hlNode.getKey());
                                        }
                                        // break;
                                    }
                                    const textBlockNode = $createTextBlockNode()
                                    textBlockNode.append(hlNode);
                                    paragraphNode.append(textBlockNode);
                                }

                            }else if (citationsDoc.includes(word)){
                                // citation
                                const hlNode = $createHighlightDepNode('highlight-cite', word);
                                hlNode.setStyle('color: #014591');
                                for (var k in modifiedPart){
                                    if (start >= modifiedPart[k][0] && end <= modifiedPart[k][1]){
                                        hlNode.setStyle('text-decoration: #f77c7c wavy underline');
                                        // console.log("underlineNode", under)
                                        under.push(hlNode.getKey());
                                    }
                                    // break;
                                }
                                const textBlockNode = $createTextBlockNode()
                                textBlockNode.append(hlNode);
                                paragraphNode.append(textBlockNode);
                            } else{
                                let isModified = false;
                                for (var k in modifiedPart){
                                    if (start >= modifiedPart[k][0] && end <= modifiedPart[k][1]){
                                        // console.log(`[${current()}]`+ '[ModifierPlugin] modifiedPart[word]', word)
                                        textNode.setStyle('text-decoration: #f77c7c wavy underline');
                                        isModified = true;
                                    }
                                    // break;
                                }
                                // normal text
                                if (!isModified){
                                    // const textNode = $createTextNode(paragraph.slice(start, end));
                                    paragraphNode.append(textNode);
                                }else{
                                    const hlNode = $createHighlightDepNode('modified-word', word);
                                    const textBlockNode = $createTextBlockNode()
                                    textBlockNode.append(hlNode);
                                    paragraphNode.append(textBlockNode);
                                }
                                
                            }
                            
                        }

                        // Finally, append the paragraph to the root
                        root.append(paragraphNode);
                        
    
                    }
                    // dispatch(setModifiedState(false))
                    // dispatch(setModifiedJson(''))
                    dispatch(setunderLineNodeKeys(under))
                    // console.log('underlineNodeKeys', underlineNode)
                }
                
        })
        
    
    }
    }, [modifiedJson]);
}