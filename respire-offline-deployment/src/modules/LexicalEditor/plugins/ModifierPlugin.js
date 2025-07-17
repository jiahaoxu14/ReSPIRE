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
  } from '../../LexicalEditor/slices/EditorSlice.js'
  import { $createHighlightDepNode } from '../nodes/HighlightDepNode'
  import { $createTextBlockNode, $isTextBlockNode } from '../nodes/TextBlockNode'
  
export default function ModifierPlugin() {
    const [editor] = useLexicalComposerContext();
    const dispatch = useDispatch();
    const generatedReport = useSelector(state => state.editor.report)
    const modifiedJson = useSelector(state => state.editor.modifiedJson)
    const modifiedState = useSelector(state => state.editor.ModifiedState)
    const allKeywords = useSelector(state => state.editor.keywords)
    const userKeyword = useSelector(state => state.editor.UserKeywords)

    useEffect(() => {
        console.log('[ModifierPlugin] modifiedState', modifiedState, "modified", modifiedJson.length)
        if (modifiedJson) {
            const jsonReport = JSON.parse(generatedReport);
            // const modifiedJson = JSON.parse(modified);
            console.log('[ModifierPlugin] modifiedJson', modifiedJson)
            console.log('[ModifierPlugin] jsonReport', jsonReport)
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
                    entries = citation.split(", ");
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
            citationsDoc = citationsDoc.filter((item, index) => citationsDoc.indexOf(item) === index);

            //json report
            const paragraphs = [];
            // const modifiedIndex = [];
            const modifiedArray = [];
            const citeDict = {}; 

            for (var item in jsonReport){
                if (item === "Introduction" || item === "Conclusion"){
                    let citeText = jsonReport[item].replace(/\s*\[[^\]]+\]/g, '');
                    citeText = citeText.replace(/\(.*?\)/g, '');
                    for (let [keyword, citation] of Object.entries(citeKeywords1)) {
                        let regex = new RegExp(`\\b${keyword}s?\\b`);
                        citeText = citeText.replace(regex, `${keyword} ${citation}`);
                    }
                    paragraphs.push(citeText);

                    const citationPattern = /\[.*?\]/g; // Pattern to match citations like "[CIA_9]"
                    const citations = [];

                    let match;
                    while ((match = citationPattern.exec(citeText)) !== null) {
                        citations.push({ index: match.index, length: match[0].length, text: match[0]});
                    }
                    citeDict[item] = citations;
                    console.log('[ModifierPlugin] cluster name', item, 'citationsList', citations);

                    let modifiedList = []
                    for (var jdx in modifiedJson[item].index){
                        let newPosition = modifiedJson[item].index[jdx];
                        console.log('[ModifierPlugin]  newPosition', newPosition)
                        for (const citation of citations) {
                            if (citation.index <= newPosition[0]) {
                                newPosition[0] += citation.length + 1;
                                newPosition[1] += citation.length + 1;
                            }
                            else if (citation.index <= newPosition[1] && citation.index > newPosition[0]) {
                                newPosition[1] += citation.length + 1;
                            }
                        }
                        console.log('[ModifierPlugin]  newPosition2', newPosition)
                        modifiedList.push(newPosition);
                    }
                    modifiedArray.push(modifiedList);
                    modifiedArray.push(modifiedJson[item]["index"])
                }else{
                    const mp = jsonReport[item];
                    let j = 0;
                    for (var p in mp){
                        paragraphs.push(mp[p].name);
                        // let citeText = mp[p].text;
                        let citeText = mp[p].text.replace(/\s*\[[^\]]+\]/g, '');
                        citeText = citeText.replace(/\(.*?\)/g, '');

                        for (let [keyword, citation] of Object.entries(citeKeywords2[mp[p].id])) {
                            let regex = new RegExp(`\\b${keyword}s?\\b`);
                            citeText = citeText.replace(regex, `${keyword} ${citation}`);
                        }

                        paragraphs.push(citeText);
                        const citationPattern = /\[.*?\]/g; // Pattern to match citations like "[CIA_9]"
                        const citations = [];

                        let match;
                        while ((match = citationPattern.exec(citeText)) !== null) {
                            citations.push({ index: match.index, length: match[0].length });
                        }
                        citeDict[mp[p].id] = citations;
                        console.log('[ModifierPlugin] cluster name', mp[p].name, 'citationsList', citations);

                        let modifiedList = []
                        if (!modifiedJson.hasOwnProperty(mp[p].id)){
                            modifiedList.push([0, citeText.length]);
                            modifiedArray.push(modifiedList);
                        }else{
                            for (var jdx in modifiedJson[mp[p].id].index){
                                let position = modifiedJson[mp[p].id].index[jdx];
                                let newP1 = position[0];
                                let newP2 = position[1];
                                console.log('[ModifierPlugin]  newPosition', [newP1, newP2])
                                for (const citation of citations) {
                                    if (citation.index <= newP1) {
                                        newP1 = position[0] + citation.length + 1;
                                        newP2 = position[1] + citation.length + 1;
                                    }
                                    else if (citation.index <= newP1 && citation.index > newP2) {
                                        newP1 = position[0];
                                        newP2 = position[1] + citation.length + 1;
                                    }   
                                }
                                console.log('[ModifierPlugin]  newPosition2', [newP1, newP2])
                                modifiedList.push([newP1,newP2]);

                            }
                            modifiedArray.push(modifiedList);
            
                        }
                        console.log('[ModifierPlugin] modifiedJson_item', modifiedJson[mp[p].id])
                        console.log('[ModifierPlugin] modifiedArray_item', modifiedArray[modifiedArray.length-1])

                    }
                }
            }
            console.log('[ModifierPlugin] modifiedArray', modifiedArray)
            // add the citation insertion here.
            console.log('[ModifierPlugin] paragraphs', paragraphs)

            
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

                        const chunks = [];
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
                        console.log("[ModifierPlugin] matches", matches)

                        let results = {};
                        for (var j in matches){
                            let match = matches[j][0];
                            // let ref = match.slice(1, -1);
                            console.log('[ModifierPlugin] match', match.slice(1,match.length-1))
                            const contents = match.slice(1,match.length-1).split(',').map(item => item.trim());
                            console.log('[ModifierPlugin] contents', contents)
                            let startIndex = matches[j].index + 1;
                            for (var k in contents){
                                results[contents[k]] = {};
                                results[contents[k]].match = contents[k];
                                results[contents[k]].startIndex = startIndex;
                                results[contents[k]].endIndex = startIndex + contents[k].length;
                                chunks.push(startIndex);
                                chunks.push(startIndex + contents[k].length);
                                startIndex = startIndex + contents[k].length + 2;
                            }
                        }
                        console.log("[ModifierPlugin] results", results)

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
                        console.log("[ModifierPlugin] modifiedPart", modifiedPart);
                        

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
                            
                            console.log('[ModifierPlugin] word', word)
                            if(keywords.includes(word)) {
                                if (userKeyword !== undefined){
                                    console.log("[ModifierPlugin]  Give colors to the keywords")
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
                                        console.log('[ModifierPlugin] modifiedPart[word]', word)
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