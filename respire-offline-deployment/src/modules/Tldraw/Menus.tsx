import React from "react";
import { 
  Tldraw, 
  TldrawUiIcon,
  TLComponents, 
  TLShape,
  DefaultPageMenu, 
  useEditor,
  DefaultToolbar,
  DefaultColorStyle,
	DefaultStylePanel,
	DefaultStylePanelContent,
	TLUiStylePanelProps,
	TldrawUiButton,
	TldrawUiButtonLabel,
	useRelevantStyles,
  TLUiContextMenuProps,
  DefaultContextMenu,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  DefaultContextMenuContent,
} from "tldraw";
import 'tldraw/tldraw.css';
import '../Space2Think/style.css';
import { current } from "../LexicalEditor/time";


function CustomToolbar() {
	return (
			<DefaultToolbar />
	)
}

function UseMyEditor(){
  const editor = useEditor();
  // Any additional logic involving 'editor'
  return editor;
}

function isSelectionWrappedByTagName(tagName) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let commonAncestor = range.commonAncestorContainer;

      // Ensure the common ancestor is an element if it's not (e.g., it's text node), use its parent
      if (commonAncestor && commonAncestor.nodeType !== 1) {
          commonAncestor = commonAncestor.parentNode;
      }

      // Check if the common ancestor is the desired tag or has an ancestor that is
      while (commonAncestor != null && commonAncestor.nodeType === 1) {
        if (commonAncestor.tagName && commonAncestor.tagName.toLowerCase() === tagName.toLowerCase()) {
              return true;
          }
          commonAncestor = commonAncestor.parentNode;
      }
  }
  return false;
}
     
function GetDivBySelectedText(className: string) {
  // get the selected text
  const selection = window.getSelection();
  const selectedId = '';
  // get the shape id of the shape with the selected text
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let commonAncestor = range.commonAncestorContainer;    
    
    // Ensure the common ancestor is an element if it's not (e.g., it's a text node), use its parent
    if (commonAncestor.nodeType === 3) {
      return commonAncestor;
    }
    console.log(`[${current()}]`+ "[Menus] commonAncestor2", commonAncestor);
  }
  return null;
}


function updateShapeWithHighlight(editor, text: string, add: boolean) {

  const onlySelectedShape = editor.getOnlySelectedShape();

  if (onlySelectedShape){
    const id = onlySelectedShape.id;
    const type = onlySelectedShape.type;
    const props = onlySelectedShape.props;

    const highlights = [...props.highlight];
    console.log(`[${current()}]`+ "[Menus] highlights text", text.trim().replace(/^[.,\s]+|[.,\s]+$/g, ''))
    const highlightText = text.trim().replace(/^[.,\s]+|[.,\s]+$/g, '');
    const trimText = text.trim();
    if (add && highlights.includes(highlightText) === false) {
      highlights.push(highlightText);
    } else {
      for (let i = 0; i < highlights.length; i++) {
        if (highlights[i].includes(trimText))  {
          highlights.splice(i, 1);
          break;
        }
      }

    }
    editor.updateShape(
      {
        id, // required
        type, // required
        props: {
          ...props,
          highlight: highlights,
        },
      },
    )
  }
}

function adoptLLMHighlight(editor, text: string) {
  const onlySelectedShape = editor.getOnlySelectedShape();

  const fullText = GetDivBySelectedText(text)?.textContent;
  console.log(`[${current()}]`+ "[Menus] fullText", fullText)
  // const parent
  if (onlySelectedShape && fullText !== null){
    const id = onlySelectedShape.id;
    const type = onlySelectedShape.type;
    const props = onlySelectedShape.props;

    const commonhl = [...props.commonhl];
    const llmhl = [...props.llmhighlight];

    commonhl.push(fullText);
    const index = llmhl.indexOf(fullText);
      if (index > -1) {
        llmhl.splice(index, 1);
      }

    editor.updateShape(
      {
        id, // required
        type, // required
        props: {
          ...props,
          commonhl: commonhl,
          llmhighlight: llmhl,
        },
      },
    )
    // console.log(`[${current()}]`+ q"[Menus] new props", onlySelectedShape.props)
  }

}

function abandonLLMHighlight(editor, text: string) {
  const onlySelectedShape = editor.getOnlySelectedShape();

  const fullText = GetDivBySelectedText(text)?.textContent;
  // const parent
  if (onlySelectedShape && fullText !== null){
    const id = onlySelectedShape.id;
    const type = onlySelectedShape.type;
    const props = onlySelectedShape.props;
    // console.log("props", props)

    const llmhl = [...props.llmhighlight];
    const omithl = [...props.omithl];

    omithl.push(fullText);
    const index = llmhl.indexOf(fullText);
      if (index > -1) {
        llmhl.splice(index, 1);
      }

    editor.updateShape(
      {
        id, // required
        type, // required
        props: {
          ...props,
          llmhighlight: llmhl,
          omithl: omithl,
        },
      },
    )
  }
}

function cancelCombinedHighlight(editor, text: string) {
  const onlySelectedShape = editor.getOnlySelectedShape();

  const fullText = GetDivBySelectedText(text)?.textContent;
  // const parent
  if (onlySelectedShape && fullText !== null){
    const id = onlySelectedShape.id;
    const type = onlySelectedShape.type;
    const props = onlySelectedShape.props;
    console.log(`[${current()}]`+ "[Menus] props", props)

    const commonhl = [...props.commonhl];
    const omithl = [...props.omithl];

    omithl.push(fullText);
    const index = commonhl.indexOf(fullText);
      if (index > -1) {
        commonhl.splice(index, 1);
      }

    editor.updateShape(
      {
        id, // required
        type, // required
        props: {
          ...props,
          commonhl: commonhl,
          omithl: omithl,
        },
      },
    )
  }
}

function cancelOmitHighlight(editor, text: string) {
  const onlySelectedShape = editor.getOnlySelectedShape();

  const fullText = GetDivBySelectedText(text)?.textContent;
  // const parent
  if (onlySelectedShape && fullText !== null){
    const id = onlySelectedShape.id;
    const type = onlySelectedShape.type;
    const props = onlySelectedShape.props;
    console.log(`[${current()}]`+ "[Menus] props", props)

    const omithl = [...props.omithl];

    const index = omithl.indexOf(fullText);
      if (index > -1) {
        omithl.splice(index, 1);
      }

    editor.updateShape(
      {
        id, // required
        type, // required
        props: {
          ...props,
          omithl: omithl,
        },
      },
    )
  }
}

function CustomContextMenu(props: TLUiContextMenuProps) {
  const selectedText = window.getSelection().toString();
  const isSelectedText = selectedText.length > 0 && selectedText.trim() !== '';
  const isSelectedTextInHighlight = isSelectionWrappedByTagName('highlight');
  const isSelectedTextInLLMHighlight = isSelectionWrappedByTagName('llmhighlight');
  const isSelectedTextInCombHl = isSelectionWrappedByTagName('commonhl');
  const isSelectedTextInOmitHl = isSelectionWrappedByTagName('omithl');
  // const isSelectionWrappedByTag = doesSelectionWrappedByTagName(['llmhighlight', 'commonhl', 'omithl']);
  const editor = useEditor();
  // console.log("editor", editor.getSelectedShapeIds())
  const isSelectedShape = editor.getSelectedShapeIds().length > 0;
  const shapeId = editor.getSelectedShapeIds()[0];

	return (
		<DefaultContextMenu {...props}>
			<TldrawUiMenuGroup id="highlight">
				<TldrawUiMenuItem
					id="highlight"
					label="Highlight"
					icon="highlight"
          disabled={(!isSelectedText || isSelectedTextInHighlight || !isSelectedShape || isSelectedTextInLLMHighlight || isSelectedTextInCombHl || isSelectedTextInOmitHl)}
					// readonlyOk
					onSelect={() => {
            updateShapeWithHighlight(editor, selectedText, true);
            console.log(`[${current()}]`+ "[Menus] highlight");
					}}
				/>
        <TldrawUiMenuItem
					id="clhighlight"
					label="Cancel highlight"
					icon="Cancel highlight"
          disabled={!isSelectedText || !isSelectedTextInHighlight || isSelectedTextInCombHl || isSelectedTextInOmitHl}
					// readonlyOk
					onSelect={() => {
            updateShapeWithHighlight(editor, selectedText, false);
            console.log(`[${current()}]`+ "[Menus] cancel highlight");
					}}
				/>
        <TldrawUiMenuItem
					id="adopt"
					label="Adopt LLM highlight"
					icon="Adopt"
          disabled={!isSelectedText || !isSelectedTextInLLMHighlight || isSelectedTextInCombHl || isSelectedTextInOmitHl}
					// readonlyOk
					onSelect={() => {
            adoptLLMHighlight(editor, selectedText);
            console.log(`[${current()}]`+ "[Menus] adopt LLM highlight");
					}}
				/>
        <TldrawUiMenuItem
					id="abandon"
					label="Abandon LLM highlight"
					icon="Abandon"
          disabled={!isSelectedText || !isSelectedTextInLLMHighlight || isSelectedTextInCombHl || isSelectedTextInOmitHl}
					// readonlyOk
					onSelect={() => {
            abandonLLMHighlight(editor, selectedText);
            console.log(`[${current()}]`+ "[Menus] abandon LLM highlight");
					}}
				/>
        <TldrawUiMenuItem
					id="clhighlight2"
					label="Cancel highlight"
					icon="Cancel highlight"
          disabled={!isSelectedText || !isSelectedTextInCombHl || isSelectedTextInOmitHl}
					// readonlyOk
					onSelect={() => {
            console.log(`[${current()}]`+ "[Menus] cancel combined highlight");
            cancelCombinedHighlight(editor, selectedText);
					}}
				/>
        <TldrawUiMenuItem
					id="cllinethrough"
					label="Cancel anti-highlight"
					icon="Cancel anti-highlight"
          disabled={!isSelectedText || !isSelectedTextInOmitHl}
					// readonlyOk
					onSelect={() => {
            console.log(`[${current()}]`+ "[Menus] cancel line through");
            cancelOmitHighlight(editor, selectedText);
					}}
				/>
			</TldrawUiMenuGroup>
		</DefaultContextMenu>
	)
}

function CustomStylePanel(props: TLUiStylePanelProps) {
	const editor = useEditor()

	// Styles are complex, sorry. Check our DefaultStylePanel for an example.

	const styles = useRelevantStyles()
  const selectedText = window.getSelection().toString();
  const isSelectedText = selectedText.length > 0 && selectedText.trim() !== '';
  const isSelectedTextInHighlight = isSelectionWrappedByTagName('highlight');
  const isSelectedTextInLLMHighlight = isSelectionWrappedByTagName('llmhighlight');
  const isSelectedTextInCombHl = isSelectionWrappedByTagName('commonhl');
  const isSelectedTextInOmitHl = isSelectionWrappedByTagName('omithl');
  const isSelectedShape = editor.getSelectedShapeIds().length > 0;
  const shapeId = editor.getSelectedShapeIds()[0];

	return (
		<DefaultStylePanel {...props}>
      <div id="highlight_tip" style={{display: "block"}}>
        <div style={{padding: "0.5em", borderRadius: "0.25em"}}>
          <div style={{textAlign: "center", fontSize:"large"}}><b>Highlights:</b></div>
        </div>
        <div style={{padding: "0.5em", borderRadius: "0.25em", opacity: "0.7"}}>
          <div style={{textAlign: "center"}}><b style={{backgroundColor: "#fcfc03"}}>User</b> highlights</div>
        </div>
        <div style={{padding: "0.5em", borderRadius: "0.25em", opacity: "0.7"}}>
        <div style={{textAlign: "center"}}><b style={{backgroundColor: "#5bc8f3"}}>
          LLM</b> highlights</div>
        </div>
        <div style={{padding: "0.5em", borderRadius: "0.25em", opacity: "0.7"}}>
        <div style={{textAlign: "center"}}><b style={{backgroundColor: "#4afd65"}}>
          Common</b> highlights</div>
        </div>
        <div style={{padding: "0.5em", borderRadius: "0.25em", opacity: "0.7"}}>
        <div style={{textAlign: "center"}}><b style={{backgroundColor: "#dddbdb",textDecorationLine: "line-through"}}>
          Omit</b> highlights</div>
        </div>
      </div>
		</DefaultStylePanel>
	)
}

const MenuComponents: TLComponents = {
	PageMenu: null, // null will hide the page menu instead
  Toolbar: null,
  // StylePanel: null, // null will hide the panel instead
  // Toolbar: CustomToolbar,
  StylePanel: CustomStylePanel, // null will hide the panel instead
  ContextMenu: CustomContextMenu
}


export default MenuComponents;