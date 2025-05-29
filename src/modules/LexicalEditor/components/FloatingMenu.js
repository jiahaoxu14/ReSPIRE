import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addDependency, getDependencies } from '../neo4j'
import { useDispatch, useSelector } from 'react-redux'
import {
  positionFloatingButton,
  highlightDepText,
  removeNode,
  colorMapping
} from '../utils'
import { $isHighlightDepNode } from '../nodes/HighlightDepNode'
import {
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $setSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
  $isParagraphNode,
  $isTextNode,
  $createRangeSelection,
  $getRoot,
  $createTextNode,
  createCommand,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  FORMAT_TEXT_COMMAND
} from 'lexical'
import {
  ELABORATE_COMMAND,
  ADD_EXAMPLE_COMMAND,
  SHOW_DEPENDENCY_COMMAND,
  ADD_TO_GRAPH_COMMAND,
  lowPriority,
  highPriority
} from '../commands/SelfDefinedCommands'
import { mergeRegister } from '@lexical/utils'
import {
  // setAdoptHl,
  // setRmHl,
  // setNewHl,
  setUserKeywords,
} from '../slices/EditorSlice'
import { StrikethroughS } from '@material-ui/icons'

export function FloatingMenu ({ editor }) {
  const buttonRef = useRef(null)
  const curClickedNodeKey = useSelector(state => state.editor.curClickedNodeKey)
  const [isHl, setHl] = useState(true)
  const [iscitation, setcitation] = useState(false)
  const dispatch = useDispatch()
  const allKeywords = useSelector(state => state.editor.keywords)
  const userKeywords = useSelector(state => state.editor.userKeywords)
  // const newHl = useSelector(state => state.editor.newHl)
  // const rmHl = useSelector(state => state.editor.rmHl)
  // const adoptHl = useSelector(state => state.editor.adoptHl)

  // callback updating floating button position
  const updateFloatingButton = useCallback(() => {
    console.log("updateFloatingButton was called")

    const selection = $getSelection()
    // const selection = $getSelection()
    if (selection == null || selection.isCollapsed() || selection.getNodes().length !== 1) {
      positionFloatingButton(buttonRef.current, null)
      return false
    }
    const node = selection.getNodes()[0]
    if ($isHighlightDepNode(node)) {
      const text = node.getTextContent()
      const ref = text.match(/[A-Z]+_\d+/g);
      if (ref !== null){
        setcitation(true)
        setHl(false)
      }else{
        setHl(true)
        setcitation(false)
      }
    }
    else{
      setHl(false)
      setcitation(false)
    }
    const buttonElem = buttonRef.current
    const nativeSelection = window.getSelection()

    if (buttonElem === null) {
      // console.log('buttonElem is null')
      return
    }

    const rootElement = editor.getRootElement()
    if (
      selection != null &&
      !nativeSelection.isCollapsed &&
      rootElement != null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      // console.log('selection is not null')
      const domRange = nativeSelection.getRangeAt(0)
      let rect
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild
        }
        rect = inner.getBoundingClientReact()
      } else {
        rect = domRange.getBoundingClientRect()
      }

      positionFloatingButton(buttonElem, rect)
    } else {
      // console.log('selection is null')
      positionFloatingButton(buttonElem, null)
    }

    return true
  }, [editor])

  useEffect(() => {
    const buttonElem = buttonRef.current
    
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateFloatingButton()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateFloatingButton()
          return false
        },
        lowPriority
      ),
      
    )
  }, [editor, updateFloatingButton, 
    // curClickedNodeKey
  ])

  // useEffect(() => {
  //   if (newHl !== ''){
  //     editor.update(() => {
  //       const selection = $getSelection();
  //       const node = selection.getNodes()[0];
  //       const curRangeNodeKey = node.getKey();
  //       // node.setStyle(
  //       //    `background-color: white; text-decoration: line-through;`
  //       // );
  //       // console.log('curNode', node.getTextContent());
  //       // console.log('selection', selection.getTextContent());
  //       // dispatch(setNewHl(selection.getTextContent()));
  //     });
  //   }
  // },[newHl, rmHl, adoptHl])

  return (
    <div>
  {!isHl && !iscitation ? (
    <div ref={buttonRef} className='floatbuttongroup'>
      <button
        className='float-item'
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            const node = selection.getNodes()[0];
            const curRangeNodeKey = node.getKey();
            console.log('curNode', node.getTextContent());
            console.log('selection', selection.getTextContent());
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')
            // dispatch(setNewHl(selection.getTextContent()));
            userKeywords["userKy"].append(selection.getTextContent())
            dispatch(setUserKeywords(userKeywords));

            positionFloatingButton(buttonRef.current, null);
          });
        }}
      >
        Highlight
      </button>
    </div>
  ) : isHl && !iscitation ? (
    <div ref={buttonRef} className='floatbuttongroup'>
      <button
        className='float-item'
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            const node = selection.getNodes()[0];
            console.log('curNode', node.getTextContent());
            // dispatch(setAdoptHl(node.getTextContent()));
            userKeywords["userKy"].append(selection.getTextContent())
            dispatch(setUserKeywords(userKeywords));
            // node.setStyle(
            //   `background: 'green'; color: 'black';`
            // )
            positionFloatingButton(buttonRef.current, null);
          });          
        }}
      >
        Adopt Highlight
      </button>
      <button
        className='float-item'
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            const node = selection.getNodes()[0];
            // dispatch(setRmHl(selection.getTextContent()));
            userKeywords["omitKy"].append(selection.getTextContent())
            dispatch(setUserKeywords(userKeywords));
            console.log('curNode', node.getTextContent());
            // node.setStyle(
            //   `background: 'white'; color: 'black';textDecoration: 'line-through';`
            // )
            positionFloatingButton(buttonRef.current, null);
          });  
        }}
      >
        Cancel Highlight
      </button>
    </div>
  ) : null}
</div>
  )
}