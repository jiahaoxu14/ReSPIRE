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
import { current } from "../time";


export default function LinkBackPlugin() {
    const [editor] = useLexicalComposerContext();
    const dispatch = useDispatch();
    const generatedReport = useSelector(state => state.editor.report);
    const userKeyword = useSelector(state => state.editor.UserKeywords);
    const [report, setReport] = useState('');
    const allKeywords = useSelector(state => state.editor.keywords);
    const selectedId = useSelector(state => state.space.selectedId);
    const [secDict, setSecDict] = useState({});

    function simplifyStrings(str1) {
        // Remove punctuation and special characters
        return str1.toLowerCase().trim();
    }

    useEffect(() => {
      if (generatedReport) {
        const report = JSON.parse(generatedReport);
        const secDict = {}
        let i = 0;
        for (var item in report) {
          if (item=="Introduction"||item=="Conclusion") {
            i += 1;
            continue;
          }else{
            const paras = report[item];
            for (var para in paras) {
              const id = report[item][para].id;
              secDict[id] = i+1;
              i += 2;
            }
          }
        }
        setSecDict(secDict);
        console.log(`[${current()}]`+ '[LinkBackPlugin] secDict', secDict);
      }
    },[generatedReport]);
    
    
    useEffect(() => {
      // console.log('[LinkBackPlugin]selectedId', selectedId);
      if (selectedId){
        
        if (selectedId.includes("shape")){

          // link back to paragraph
          editor.update(() => {
            const root = $getRoot();
            const paragraphs = root.getChildren();
            // console.log('[LinkBackPlugin]secDict', secDict);
            const idx = secDict[selectedId];
            // console.log('[LinkBackPlugin]paragraphs[idx]', paragraphs[idx[0]].getTextContent(), 'idx', idx);
            if (paragraphs[idx]){
              console.log(`[${current()}]`+ "[LinkBackPlugin] Link frame back to section, lexical node:", paragraphs[idx-1].getChildren());
              paragraphs[idx-1].getChildren()[0].getChildren()[0].setStyle('background-color: #f4f7b2');
              
              // make all unselected nodes to white background
              $nodesOfType(TextNode).forEach((node) => {
                node.setStyle('background-color: white');
              });
              $nodesOfType(TextBlockNode).forEach((node) => {
                // console.log("[LinkBackPlugin] node", node.__hl_type, node.__parent, paragraphs[idx].__key)
                if(node.getChildren()[0].__hl_type!=='llm-highlight-word'&& node.getChildren()[0].__hl_type!=='combine-highlight-word' && node.__parent!==paragraphs[idx].__key && node.__parent!==paragraphs[idx-1].__key){
                  const selectedNode = node.getChildren()[0];
                  selectedNode.setStyle('background-color: white; opacity: 0.7');
                  // if (selectedNode.__hl_type==='highlight-cite'){
                  //   selectedNode.setStyle('background-color: white; opacity: 0.7; color: #014591;');
                  // }
                  // else if (selectedNode.__hl_type==='modified-word'){
                  //   selectedNode.setStyle('background-color: white; opacity: 0.7');
                  // }
                }
              });

              // make selected node to yellow background
              paragraphs[idx].getChildren().forEach((child, index) => {
                if(child.__type === 'text'){
                  child.setStyle('background-color: #f4f7b2');
                }else{
                  const node = child.getChildren()[0];
                  if(node.__hl_type==='highlight-cite' || node.__hl_type==='modified-word'){
                    // console.log("[LinkBackPlugin] child.getChildren",node);
                    node.setStyle('background-color: #f4f7b2; opacity: 1');
                  }
                }
              });
            }
            
          });
        }else if (selectedId.includes("_")){
          console.log(`[${current()}]`+ '[LinkBackPlugin] Link document back to citation', selectedId);
          // link back to citation
          editor.update(() => {
            // make all unselected nodes to white background
            $nodesOfType(TextNode).forEach((node) => {
              node.setStyle('background-color: white');
            });
            $nodesOfType(TextBlockNode).forEach((node) => {
              const selectedNode = node.getChildren()[0];
              // selectedNode.setStyle('background-color: white; opacity: 0.7')
              // if(selectedNode.__hl_type==='highlight-cite' || selectedNode.__hl_type==='modified-word'){
              //   selectedNode.setStyle('background-color: white; opacity: 0.7');
              // }
              if (selectedNode.__hl_type==='highlight-cite'){
                selectedNode.setStyle('background-color: white; opacity: 0.7; color: #014591;');
              }
              else if (selectedNode.__hl_type==='modified-word' || selectedNode.__hl_type==='highlight-sec'){
                selectedNode.setStyle('background-color: white; opacity: 0.7');
              }
              // if(selectedNode.__hl_type!=='llm-highlight-word'&& selectedNode.__hl_type!=='combine-highlight-word')
              //   {
              //   const selectedNode = node.getChildren()[0];
              //   selectedNode.setStyle('background-color: white; opacity: 0.7');
                // if (selectedNode.__hl_type==='highlight-cite'){
                //   selectedNode.setStyle('background-color: white; opacity: 0.7; color: #014591;');
                // }
                // else if (selectedNode.__hl_type==='modified-word'){
                //   selectedNode.setStyle('background-color: white; opacity: 0.7');
                // }
              // }
            });

            // make selected node to yellow background
            $nodesOfType(HighlightDepNode).forEach((node) => {
              if(node.__text === selectedId){
                node.setStyle('background-color: #fcfc03; font-weight: bold; font-size: large;');
              }
            });
          });

        } 

      }else{
        editor.update(() => {
          console.log(`[${current()}]`+ '[LinkBackPlugin] Click blank');
          $nodesOfType(TextNode).forEach((node) => {
            node.setStyle('background-color: white');
          });
          $nodesOfType(TextBlockNode).forEach((node) => {
            const selectedNode = node.getChildren()[0];
            // selectedNode.setStyle('background-color: white; opacity: 0.7')
            // console.log("[LinkBackPlugin] node", node.__hl_type, node.__parent, paragraphs[idx].__key)
            // if(selectedNode.__hl_type!=='llm-highlight-word'&& selectedNode.__hl_type!=='combine-highlight-word'){
            //   selectedNode.setStyle('background-color: white; opacity: 0.7');
            // }
            if (selectedNode.__hl_type!==undefined){
              if(selectedNode.__hl_type!=='llm-highlight-word'&& selectedNode.__hl_type!=='combine-highlight-word')
              {
                const selectedNode = node.getChildren()[0];
                selectedNode.setStyle('background-color: white; opacity: 0.7');
              }
              // if (selectedNode.__hl_type==='highlight-cite'){
              //   selectedNode.setStyle('background-color: white; opacity: 0.7; color: #014591;');
              // }
              // else if (selectedNode.__hl_type==='modified-word'){
              //   selectedNode.setStyle('background-color: white; opacity: 0.7');
              // }
            }
          });
          
        });
      }
       
      }, [selectedId]);
    // return null;
}
