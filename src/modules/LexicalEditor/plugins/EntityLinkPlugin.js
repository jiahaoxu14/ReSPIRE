// import { registerCodeHighlighting } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getRoot, 
    $nodesOfType,
    $getSelection, 
    $createParagraphNode, 
    $createTextNode, 
    $getNodes,
    $createLineBreakNode,
    $getNodeByKey, 
    TextNode,
    // $createCodeHighlightNode,
} from 'lexical';
import { HighlightDepNode } from '../nodes/HighlightDepNode'
import { TextBlockNode } from '../nodes/TextBlockNode'


import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    setCurClickedNodeKey,
    setCurClickedCiteKey,
  } from '../slices/EditorSlice'

import {current} from '../time'

export default function LinkBackPlugin() {
    const [editor] = useLexicalComposerContext();
    const dispatch = useDispatch();
    const selectedEntity = useSelector(state => state.space.selectedEntity);

    useEffect(() => {
        editor.update(()=>{
            console.log(`[${current()}]`+ '[EntityeLinkPlugin] selectedEntity', selectedEntity)
            $nodesOfType(HighlightDepNode).forEach((node) => {
                if(node.__text === selectedEntity){
                    node.setStyle('font-weight: bold; font-size: large; text-decoration: underline; opacity: 1;');
                    // dispatch(setCurClickedNodeKey(node.__text))
                }
                else if (node.__hl_type === "llm-highlight-word"||node.__hl_type === "combine-highlight-word"){
                    node.setStyle('opacity: 0.7;')
                }
              });
        })
    }, [selectedEntity]);
}