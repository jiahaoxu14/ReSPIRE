// import { registerCodeHighlighting } from "@lexical/code";
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
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
  } from '@lexical/rich-text'
import CodeHighlightPlugin from './CodeHighlightPlugin'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import {$createListNode} from '@lexical/list'
import { TextBlockNode } from '../nodes/TextBlockNode'
import { $createTextBlockNode, $isTextBlockNode } from '../nodes/TextBlockNode'
import { $createHighlightDepNode } from '../nodes/HighlightDepNode'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showModifications } from "../../Space2Think/api/showModification.tsx";
import {
    setModifiedJson,
    setModifiedState,
    setNodeKeys,
    setNodeContent,
  } from '../../LexicalEditor/slices/EditorSlice.js'
import { current } from '../time'

function saveText(data) {
    if(!data) {
        console.error('No data to save');
        return;
    }

    const filename = 'textReport.txt';

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    const blob = new Blob([data], {type: 'text/json'});
    const e = document.createEvent('MouseEvents');
    const a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}


export default function ReportPlugin() {
    const [editor] = useLexicalComposerContext();
    const dispatch = useDispatch();
    const generatedReport = useSelector(state => state.editor.report)
    const userKeyword = useSelector(state => state.editor.UserKeywords)
    const [report, setReport] = useState('');
    const allKeywords = useSelector(state => state.editor.keywords)

    function simplifyStrings(str1) {
        // Remove punctuation and special characters
        return str1.toLowerCase().trim();
    }

    if (generatedReport !== '' && generatedReport !== "undefined" && generatedReport !== null && generatedReport !== undefined) {
        const jsonReport = JSON.parse(generatedReport);

        //keywords
        const citeKeywords1 = {}
        for (var item in allKeywords){
            for (var pair in allKeywords[item]){
                citeKeywords1[pair] = '[' + allKeywords[item][pair].join(', ') + ']';
            }
        }

        const citeKeywords2 = {}
        let citations = []
        for (var item in jsonReport["Middle_paragraph"]){
            citeKeywords2[jsonReport["Middle_paragraph"][item].id] = {}
            const citation = jsonReport["Middle_paragraph"][item]["keywords"].concat(", ").concat(jsonReport["Middle_paragraph"][item]["name entities"]);
            const text = jsonReport["Middle_paragraph"][item].text;
            let entries = []
            if (typeof citation === 'string'){
                entries = citation.split('], ');
            }
            else{entries = citation;}
            // console.log("[Report Plugin] citation", citation)
            entries.forEach(entry => {
                let [match1, match2] = entry.split('[')

                if (match1) {
                    let keyword = match1.trim();
                    let ref = match2.trim();
                    citeKeywords2[jsonReport["Middle_paragraph"][item].id][keyword] = "[" + ref + "]";
                    citations = citations.concat(ref);
                }
            });
        }
        citations = citations.filter((item, index) => citations.indexOf(item) === index);
        // console.log(`[${current()}]`+ "[Report Plugin] citations", citations);

        //json report
        const paragraphs = []
        for (var item in jsonReport){
            if (item === "Introduction" || item === "Conclusion"){
                let citeText = jsonReport[item].replace(/\s*\[[^\]]+\]/g, '');
                citeText = citeText.replace(/\(.*?\)/g, '');
                for (let [keyword, citation] of Object.entries(citeKeywords1)) {
                    let regex = new RegExp(`\\b${keyword}s?\\b`);
                    citeText = citeText.replace(regex, `${keyword} ${citation}`);
                }
                paragraphs.push(citeText);
            }else{
                const mp = jsonReport[item];
                for (var p in mp){
                    paragraphs.push(mp[p].name);
                    let citeText = mp[p].text.replace(/\s*\[[^\]]+\]/g, '');
                    citeText = citeText.replace(/\(.*?\)/g, '');
                    for (let [keyword, citation] of Object.entries(citeKeywords2[mp[p].id])) {
                        let regex = new RegExp(`\\b${keyword}s?\\b`);
                        citeText = citeText.replace(regex, `${keyword} ${citation}`);
                    }
                    paragraphs.push(citeText);
                    // console.log("[Report Plugin] citeText", citeText)
                }
            }
        }
        // add the citation insertion here.

        let keywords = []
        for (var item in allKeywords["comKy"]){
            keywords.push(item)
        }
        for (var item in allKeywords["llmKy"]){
            keywords.push(item)
        }

        if (generatedReport !== report) {
            //set report interface
            setReport(generatedReport)
            // console.log(`[${current()}]`+ '[ReportPlugin] generatedReport', generatedReport)

            editor.update(() => {
                const selection = $getSelection();
                const root = $getRoot();
                if (!root.isEmpty()) {
                    const nodes = root.getChildren();
                    nodes.forEach(node => {
                        node.remove()
                    })
                }

                if (generatedReport !== '') {
                    const root = $getRoot();
                    let nodeKeys = [];
                    let nodeContent = [];
                    
                    // Get the selection from the EditorState
                    const selection = root;
                    const length = paragraphs.length - 1;

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
                        // chunks.push(0);

                        //keywords put into chunks
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

                        //citations put into chunks
                        const pattern = /\[(.*?)\]/g;
                        const matches = [...paragraph.matchAll(pattern)];
                        // console.log(`[${current()}]`+ "[ReportPlugin] matches", matches)

                        let results = {};
                        for (var j in matches){
                            let match = matches[j][0];
                            // let ref = match.slice(1, -1);
                            // console.log(`[${current()}]`+ '[ReportPlugin] match', match.slice(1,match.length-1))
                            const contents = match.slice(1,match.length-1).split(',').map(item => item.trim());
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
                        // console.log(`[${current()}]`+ '[ReportPlugin] cite document results', results)

                        chunks.push(0);
                        chunks.push(paragraph.length);
                        chunks.sort((a,b)=>a-b);
                        const uniquechunks = chunks.filter((item, index) => {
                            return chunks.indexOf(item) === index;
                        });
                        // console.log(`[${current()}]`+ '[ReportPlugin] uniquechunks', uniquechunks)

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

                        // console.log(`[${current()}]`+ '[ReportPlugin] keywords', keywords)
                        console.log(`[${current()}]`+ '[ReportPlugin] userKeyword', userKeyword)

                        // keywords coloring
                        for (let j = 0; j < uniquechunks.length - 1; j++){
                            const start = uniquechunks[j];
                            const end = uniquechunks[j + 1];
                            const textNode = $createTextNode(paragraph.slice(start, end));
                            const word = paragraph.slice(start, end);
                            // console.log(`[${current()}]`+ '[ReportPlugin] word', word)
                            if(keywords.includes(word)) {
                                if (userKeyword !== undefined){
                                    // console.log(`[${current()}]`+ "[ReportPlugin] Give colors to the keywords")
                                    // const hlNode = $createHighlightDepNode('highlight-word', word);
                                    let hlNode = $createHighlightDepNode('highlight-word', word);
                                    if (userKeyword["userKy"].includes(word)){
                                        hlNode = $createHighlightDepNode('combine-highlight-word', word);
                                    }else if (userKeyword["llmKy"].includes(word)){
                                        hlNode = $createHighlightDepNode('llm-highlight-word', word)
                                    }
                                    const textBlockNode = $createTextBlockNode()
                                    textBlockNode.append(hlNode);
                                    paragraphNode.append(textBlockNode);
                                    nodeKeys.push(textBlockNode.getKey());
                                    nodeContent.push(word);
                                }
                            }else if (
                                // citations.includes(word)
                                (/^[A-Za-z]+_\d+$/).test(word)
                            ){
                                // citation
                                const hlNode = $createHighlightDepNode('highlight-cite', word);
                                hlNode.setStyle('color: #014591');
                                const textBlockNode = $createTextBlockNode()
                                textBlockNode.append(hlNode);
                                paragraphNode.append(textBlockNode);
                                nodeKeys.push(textBlockNode.getKey());
                                nodeContent.push(word);
                            } else{
                                // normal text
                                paragraphNode.append(textNode);
                                nodeKeys.push(textNode.getKey());
                                nodeContent.push(word);
                            }
                        }

                        // Finally, append the paragraph to the root
                        root.append(paragraphNode);
    
                    }

                    setReport(generatedReport);
                    dispatch(setNodeKeys(nodeKeys));
                    dispatch(setNodeContent(nodeContent));
                    //save text
                    const editorState = editor.getEditorState()
                    // saveText(editorState.toJSON())
                }
            });
        }
    }
    else{
        editor.update(() => {
            const root = $getRoot();
            if (!root.isEmpty()) {
                const nodes = root.getChildren();
                nodes.forEach(node => {
                    node.remove()
                })
            }
        });
    }
    // useEffect(() => {
    //     editor.update(() => {
    //       const selection = $getSelection();
    //       console.log('selection', selection)
    //       if (selection && report !== '') {
    //         selection.insertText('the text I wanted to insert');
    //       }
    //     });
    //   }, [editor]);
    // return null;
}
