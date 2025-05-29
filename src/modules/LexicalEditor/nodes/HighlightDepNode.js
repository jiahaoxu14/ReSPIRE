import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedTextNode
} from 'lexical'

import { addClassNamesToElement } from '@lexical/utils'
import { $applyNodeReplacement, TextNode } from 'lexical'

/** @noInheritDoc */
export class HighlightDepNode extends TextNode {

  __element: HTMLElement;
  // __prompt = "";

  static getType (): string {
    return 'hl-text'
  }

  static clone (node: HighlightDepNode): HighlightDepNode {
    return new HighlightDepNode(node.__text, node.__key)
  }

  constructor (text: string, hl_type, key?: NodeKey) {
    super(text, key)
    this.__hl_type = hl_type
    // this.__prompt = prompt
  }

  getKey() {
    return this.__key
  }

  setElementNull(){
    this.__element = null
  }

  createDOM (config: EditorConfig): HTMLElement {
    const element = super.createDOM(config)
    addClassNamesToElement(element, this.__hl_type)
    return element
  }

  // setPrompt (prompt: string) {
  //   this.__prompt = prompt
  // }

  // getPrompt (): string {
  //   const self = this.getLatest();
  //   console.log("prompt: " + self.__prompt)
  //   return self.__prompt
  // }

  updateDOM(
    prevNode,
    element,
    config,
    
  ): boolean {
    // console.log("HighlightDepNode.updateDOM.element", element)
    // console.log("HighlightDepNode.updateDOM.__hl_type", this.__hl_type)
    // console.log("HighlightDepNode.updateDOM.__element", this.__element)
    // console.log("HighlightDepNode.updateDOM: prevNode.__hl_type", prevNode.__hl_type)
    // console.log("HighlightDepNode.updateDOM. prevNode.__element", prevNode.__element)
    super.updateDOM(prevNode, element, config)
    if (this.__hl_type !== prevNode.__hl_type) {
      this.__element = prevNode.__element
      this.__hl_type = prevNode.__hl_type
      // this.__prompt = prevNode.__prompt
    }
    
    return false;
  }

  static importJSON (serializedNode: SerializedTextNode): HighlightDepNode {
    const node = $createHighlightDepNode('highlight-dep-elb', serializedNode.text, serializedNode.key)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON (): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'hl-text',
      version: 1,
    }
  }

  canInsertTextBefore (): boolean {
    return true
  }

  canInsertTextAfter (): boolean {
    return true
  }

  isTextEntity (): true {
    return true
  }
}

export function $createHighlightDepNode (hl_type, text = '', key = ''): HighlightDepNode {
  if (key !== '') {
    return new $applyNodeReplacement(HighlightDepNode(text, hl_type, key))
  } else {
    return $applyNodeReplacement(new HighlightDepNode(text, hl_type))
  }
  
}

export function $isHighlightDepNode (node: LexicalNode | null | undefined) {
  return node instanceof HighlightDepNode
}
