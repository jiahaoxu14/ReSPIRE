import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { FloatingMenu } from "../components/FloatingMenu";


export function FloatingMenuPlugin() {
  const [editor] = useLexicalComposerContext();

  return createPortal(<FloatingMenu editor={editor} />, document.body);
}