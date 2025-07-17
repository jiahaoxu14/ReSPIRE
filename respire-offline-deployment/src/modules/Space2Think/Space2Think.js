import React, { 
    useState, 
    useEffect, 
    useCallback, 
    useRef,
    createContext
 } from 'react';

// import Menus from '../Tldraw/Menus.tsx'
import MenuComponents from '../Tldraw/Menus.tsx'
import customShape from '../Tldraw/DangerousHtmlShape.tsx'

import {
    useDispatch,
    useSelector
} from 'react-redux';

import ExampleTheme from '../LexicalEditor/themes/ExampleTheme.js'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'

import Drawer from '@mui/material/Drawer'
import Grow from '@mui/material/Grow';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import NotesIcon from '@mui/icons-material/Notes';
import SearchIcon from '@mui/icons-material/Search';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';

import {
    setReport,
    setUserKeywords,
    setKeywords,
    setCurClickedNodeKey,
    setPreReport,
  } from '../LexicalEditor/slices/EditorSlice.js'

import {
setModifiedJson,
setModifiedState,
} from '../LexicalEditor/slices/EditorSlice.js'
import { showModifications } from "./api/showModification.js";

// import 'reactflow/dist/style.css';
import './style.css';
import tutorial from './dataset/tutorial.js'
import lr from './dataset/lr.js'

// comment it when you are debugging

import {Box, Button, Stack, Typography, Tooltip, Popper, Paper, MenuList, MenuItem, ClickAwayListener, Avatar, TextField} from '@mui/material';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined'
import ReportEditor from '../LexicalEditor/ReportEditor.js';
import { styled, useTheme } from '@mui/material/styles'
import MuiAppBar from '@mui/material/AppBar'
import {Tldraw, useEditor, Editor, useValue, T} from 'tldraw'

import {
    setHighlightDoc,
    setReportClose,
    setReportOpen,
    setSelectedId,
    setSelectedItems,
    setSelectedEntity,
    setPromptOpen,
} from '../LexicalEditor/slices/SpaceSlice.js'
import { useLocation } from 'react-router-dom';
import CustomUi from '../Tldraw/CustomUI.tsx';
import { reportGeneration} from './api/ReportGeneration.tsx';
import { reportGenerationBlank} from './api/ReportGenerationBlank.tsx';
import { reportToSpace } from './space/reportToSpace.js';
import { reportToClusterName } from './space/reportToClusterName.js';
import { PromptsDialog } from './space/PromptsDialog.js';
import { current } from '../LexicalEditor/time.js';
import { ApiKeyDialog } from './space/ApiKeyDialog.js';

// At the top of your file
const originalConsoleError = console.error;

function Divider () {
    return <div className='divider' />
}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

console.error = (...args) => {
    if (
        args.length === 1 &&
        typeof args[0] === 'string' &&
        args[0].includes('ResizeObserver loop completed with undelivered notifications')
    ) {
        return;
    }
    originalConsoleError(...args);
};

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

const drawerWidth = '50%';

const Main = styled('main', { shouldForwardProp: prop => prop !== 'open' })(
    ({ theme, open }) => ({
      flexGrow: 1,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      marginTop: '46px',
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }),
        marginRight: drawerWidth,
      })
    })
  )
  
  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: prop => prop !== 'open'
  })(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    height: '46px',
    backgroundColor: '#fff',
    ...(open && {
      width: `calc(100% - ${drawerWidth})`,
      marginRight: `${drawerWidth}`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    })
  }))

let id = 1;
const getId = () => 'Group' + String(id++);

const editorContext = createContext({});


const editorConfig = {
    // The editor theme
    theme: ExampleTheme,
    // Handling of errors during update
    onError (error) {
      throw error
    },
    // Any custom nodes go here
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
    //   HighlightDepNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    //   TextBlockNode
    ]
  }

function recordSnapshot(snapshot) {
    console.log(`[${current()}]`+ " [Space2Think] snapshot per minute", snapshot);
}
  
export default function Space() {
    const dispatch = useDispatch();
    const location = useLocation();
    const reportOpen = useSelector(state => state.space.reportOpen);
    const condition = useSelector(state => state.editor.condition)
    const [menuOpen, setMenuOpen] = useState(false);
    const [sMenuOpen, setSMenuOpen] = useState(false);
    const anchorRef = useRef(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [clearContent, setClearContent] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportFinish, setReportFinish] = useState(false);
    const curClickedNodeKey = useSelector(state => state.editor.curClickedNodeKey);
    const curClickedCiteKey = useSelector(state => state.editor.curClickedCiteKey);
    const highlightDoc = useSelector(state => state.space.highlightDoc);
    const [prehlDoc, setprehlDoc] = useState(null);
    const keywords = useSelector(state => state.editor.keywords);
    const report = useSelector(state => state.editor.report);
    const promptOpen = useSelector(state => state.space.promptOpen);
    const taskDescription = useSelector(state => state.space.taskDescription);
    const introduction = useSelector(state => state.space.introduction);
    const clusterDescription = useSelector(state => state.space.clusterDescription);
    const conclusion = useSelector(state => state.space.conclusion);
    const selectedEntity = useSelector(state => state.space.selectedEntity);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const yPos = useRef(0);
    const xPos = useRef(0);
    const dragRef = useRef(null);
    const [target, setTarget] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const selectedNode = useRef(null);
    const [isBold, setIsBold] = useState(false)
    const nodePos = useRef({x: 0, y: 0});

    const [editor, setEditor] = useState(null);
	const currentToolId = useValue('current tool id', () => editor?.getCurrentToolId(), [editor])
    const snapshot = useValue('snapshot', () => editor?.store.getSnapshot(), [editor]);

    const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
    const [apiKeyError, setApiKeyError] = useState('');

    // const MINUTE_MS = 5000;
    // const MINUTE_MS = 60000;

    // useEffect(() => {
    //     console.log(`[${current()}]`+ "[Space2Think] editor", editor);
    //     let interval = setInterval(() => {
    //         console.log(`[${current()}]`+ "[Space2Think] snapshot", snapshot);
    //         if (snapshot){
    //             snapshot.current = editor?.store.getSnapshot();
    //             recordSnapshot(JSON.stringify(snapshot));
    //             // console.log(`[${current()}]`+ "[Space2Think] snapshot", snapshot);
    //         }
    //     }, MINUTE_MS);
    //     return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    // }, []);


    // menu for file reading
    const handleToggle = () => {
        setMenuOpen(!menuOpen);
    }

    const handleClose = (event) => {
        setMenuOpen(false);
    };

    const handleSToggle = () => {
        setSMenuOpen(!sMenuOpen);
    };
    
    const handleSClose = () => {
        setSMenuOpen(false);
    };

    const handleSOpen = () => {
        setSMenuOpen(true);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const clearContentAgree = () => {
        setClearContent(true);
    };

    const clearContentCancel = () => {
        setClearContent(false);
    };

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
          event.preventDefault();
          setMenuOpen(false);
          setSMenuOpen(false);
        } else if (event.key === 'Escape') {
            setMenuOpen(false);
            setClearContent(false);
        }
    }

    function saveSnapshot(data) {
        if(!data) {
            console.error('No data to save');
            return;
        }

        const filename = 'textspire.json';
        
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

    function jsonFileUpload (e) {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          console.log(`[${current()}]`+ "[Space to Think] Json Data", data);
          return data;
        };
    }

    function simplifyStrings(str1) {
        // Remove punctuation and special characters
        return str1.replace(/[^\w\s]/g, '').replace(/\s+/g, '').toLowerCase().trim();
    }

    function keywordsToST(editor, oriReport){
        const keywords = {}
        const report = JSON.parse(oriReport);
        for (var item in report["Middle_paragraph"]){
            const text = report["Middle_paragraph"][item]["text"]
            const citation = report["Middle_paragraph"][item]["name entities"].concat(", ").concat(report["Middle_paragraph"][item]["keywords"])
            // console.log(`[${current()}]`+ "[keywordsToST] citation", citation);
            keywords[report["Middle_paragraph"][item].id] = {}
            if (citation){
                let entries = [];
                // console.log(`[${current()}]`+ "[keywordsToST] citation", citation)
                if (typeof citation === 'string'){
                    entries = citation.split(/], /);
                }else{
                    entries = citation;
                }
                // console.log(`[${current()}]`+ "[keywordsToST] entries", entries)
                entries.forEach(entry => {
                    let [match1, match2] = entry.split('[')
                    // let match1 = entry.match(/^(.*?)\[(.*?)\]$/);
                    // let match2 = entry.match(/[A-Z]+_\d+/g);

                    if (match1) {
                        let keyword = match1.trim();
                        let ref = match2.trim();
                        if (!keywords[report["Middle_paragraph"][item].id].hasOwnProperty(keyword)){
                            keywords[report["Middle_paragraph"][item].id][keyword] = [];
                        }
                        keywords[report["Middle_paragraph"][item].id][keyword] = keywords[report["Middle_paragraph"][item].id][keyword].concat(ref);
                    }
                    
                    // if (match1) {
                    //     let keyword = match1[1].trim();
                    //     let ref = match2;

                    //     if (!keywords[report["Middle_paragraph"][item].id].hasOwnProperty(keyword)){
                    //         keywords[report["Middle_paragraph"][item].id][keyword] = [];
                    //     }
                    //     keywords[report["Middle_paragraph"][item].id][keyword] = keywords[report["Middle_paragraph"][item].id][keyword].concat(ref);
                    //     // if (text.includes(keyword)){
                    //     //     if (!keywords[report["Middle_paragraph"][item].id].hasOwnProperty(keyword)){
                    //     //         keywords[report["Middle_paragraph"][item].id][keyword] = [];
                    //     //     }
                    //     //     keywords[report["Middle_paragraph"][item].id][keyword] = keywords[report["Middle_paragraph"][item].id][keyword].concat(ref);
                    //     // }
                    // }

                });
            }
            
        }
        // console.log(`[${current()}]`+ "[Space2Think] keywords_dict", keywords)

        // get whole llm highlights
        let llmKy = {}
        let llmKyList = []
        for (var item in keywords){
            if (keywords[item]){
                for (var k in keywords[item]){
                    if (!llmKy.hasOwnProperty(k)){
                        llmKy[k] = []
                        llmKyList.push(k)
                    }
                    llmKy[k] = llmKy[k].concat(keywords[item][k])
                }
            }
        }
        // console.log(`[${current()}]`+ "[Space2Think] llmKyList", llmKyList)

        // get whole space highlights
        const snapshot = editor.store.getSnapshot();
        // const spaceKy = {}
        let spaceComKy = []
        let spaceHlKy = []
        let spaceLlmKy = []
        // spaceKy["llmKy"] = []
        // spaceKy["hlKy"] = []
        // spaceKy["omitKy"] = []
        // console.log(`[${current()}]`+ "spaceHlKy", spaceHlKy)

        for (var item in snapshot.store){
            if(snapshot.store[item].type === "xx_html"){
                const hl = snapshot.store[item].props.highlight;
                const chl = snapshot.store[item].props.commonhl;
                const llmky = snapshot.store[item].props.llmhighlight;
                // const omitky = snapshot.store[item].props.omithl;
                hl.forEach((word) => {
                    // console.log(`[${current()}]`+ "spaceHlKy", spaceHlKy)
                    if(spaceHlKy.length === 0 || !spaceHlKy.includes(word)){
                        spaceHlKy.push(word)
                    }
                    // spaceKy[item].push(snapshot.store[item].props.label)
                });
                chl.forEach((word) => {
                    if (!spaceComKy.includes(word)){
                        spaceComKy.push(word)
                    }
                    // spaceKy[item].push(snapshot.store[item].props.label)
                });
                llmky.forEach((word) => {
                    // console.log(`[${current()}]`+ "llmky word", word)
                    if (!spaceLlmKy.includes(word)){
                        spaceLlmKy.push(word)
                    }
                    // spaceKy[item].push(snapshot.store[item].props.label)
                });
                // omitky.forEach((word) => {
                //     if (!spaceKy["omitKy"].includes(word)){
                //         spaceKy["omitKy"].push(word)
                //     }
                //     // spaceKy["omitKy"][item].push(snapshot.store[item].props.label)
                // });
            }
        }
        // console.log(`[${current()}]`+ "[Space2Think] spaceKy", spaceHlKy, spaceComKy, spaceLlmKy)
        
        // processed keywords for the whole space
        const newSpaceKy = {}
        newSpaceKy["comKy"] = []
        newSpaceKy["llmKy"] = []
        // newSpaceKy["hlKy"] = {}

        for (var item in spaceHlKy){
            const keyword = spaceHlKy[item];
            // console.log(`[${current()}]`+ "[Space2Think] spaceHlKy item", keyword)
            if (llmKyList.includes(keyword)){
                if (!newSpaceKy["comKy"].includes(keyword)) {newSpaceKy["comKy"].push(keyword)}
                //remove the keywords from llmKy
                llmKyList.splice(llmKyList.indexOf(keyword), 1)
            }
        }

        // concat spaceKy["llmKy"] and llmKyList
        const newLLMList = llmKyList.concat(spaceLlmKy)
        for (var item in newLLMList){
            if(newSpaceKy["llmKy"].includes(newLLMList[item])){continue;}
            const keyword = newLLMList[item];
            newSpaceKy["llmKy"].push(keyword)
        }

        // console.log(`[${current()}]`+ "[Space2Think] newSpaceKy", newSpaceKy)

        // const simNewChl = newSpaceKy["comKy"].map((item) => simplifyStrings(item));
        // const simNewLky = newSpaceKy["llmKy"].map((item) => simplifyStrings(item));

        // keywords with doc label
        const allKeywords = {}
        allKeywords["comKy"] = {}
        allKeywords["llmKy"] = {}
        allKeywords["hlKy"] = {}
        
        // const snapshot = editor.store.getSnapshot();
        for (var item in snapshot.store){
            if(snapshot.store[item].type === "xx_html"){
                const id = item;
                const type = snapshot.store[item].type;
                const props = snapshot.store[item].props;
                const content = snapshot.store[item].props.content;

                const shape = snapshot.store[item];
                const label = shape.props.label;
                const parentId = shape.parentId;
                const lky = [];
                const hl = [...shape.props.highlight];
                const chl = [...shape.props.commonhl];
                const ohl = [...shape.props.omithl];

                const simLky = lky.map((item) => simplifyStrings(item)); 
                const simHl = hl.map((item) => simplifyStrings(item));
                const simChl = chl.map((item) => simplifyStrings(item));
                // const simOhl = ohl.map((item) => simplifyStrings(item));

                // add newSpaceKy combine highlights to the current shape
                for (var i in newSpaceKy["comKy"]){
                    const ky = newSpaceKy["comKy"][i];
                    if (!content.includes(ky)){
                        // console.log(`[${current()}]`+ "[Space to Think]  label", label, "keyword", keyword)
                        continue;
                    }
                    const simWord = simplifyStrings(ky)

                    if (simChl.includes(simWord)){
                        continue;
                    }else{
                        chl.push(ky);
                    }

                    const index1 = simLky.indexOf(simWord);
                    if(index1 > -1){
                        lky.splice(index1, 1);
                    }

                    const index2 = simHl.indexOf(simWord);
                    if(index2 > -1){
                        hl.splice(index2, 1);
                    }

                }
                // console.log(`[${current()}]`+ "[Space2Think] ", "lky 1 ", lky, "hl", hl, "chl", chl)
                // add newSpaceKy llm highlights to the current shape
                for (var i in newSpaceKy["llmKy"]){
                    const word = newSpaceKy["llmKy"][i];
                    if (!content.includes(word)){
                        continue;
                    }
                    // console.log(`[${current()}]`+ "[Space2Think] llmky word", word)
                    if (chl.includes(word)){
                        continue;
                    }
                    const simWord = simplifyStrings(word)
                    // console.log(`[${current()}]`+ "[Space2Think] llmky compare word", word, "lky 2", lky, "simWord", simWord, "simLky", simLky)
                    if (simLky.indexOf(simWord)==-1){
                        lky.push(word);
                    } 
                }
                    editor.updateShape(
                        {
                          id, // required
                          type, // required
                          props: {
                            ...props,
                            llmhighlight: lky,
                            highlight: hl,
                            commonhl: chl,
                          },
                        },
                    )

                    if(chl.length > 0){
                        chl.forEach((item) => {
                            if(!allKeywords["comKy"].hasOwnProperty(item)){
                                allKeywords["comKy"][item] = []
                            }
                            allKeywords["comKy"][item].push(label)})
                    }
                    if(hl.length > 0){
                        hl.forEach((item) => {
                            if(!allKeywords["hlKy"].hasOwnProperty(item)){
                                allKeywords["hlKy"][item] = []
                            }
                            allKeywords["hlKy"][item].push(label)})
                    }
                    if(lky.length > 0){
                        lky.forEach((item) => {
                            if(!allKeywords["llmKy"].hasOwnProperty(item)){
                                allKeywords["llmKy"][item] = []
                            }
                            allKeywords["llmKy"][item].push(label)})
                    }
                    // if(ohl.length > 0){
                    //     ohl.forEach((item) => {
                    //         if(!allKeywords["omitKy"].hasOwnProperty(item)){
                    //             allKeywords["omitKy"][item] = []
                    //         }
                    //         allKeywords["omitKy"][item].push(label)})
                    // }
                }
            }
        
        // console.log(`[${current()}]`+ "[Space2Think] allKeywords", allKeywords)
        dispatch(setKeywords(allKeywords))
        // console.log(`[${current()}]`+ "[Space2Think] snapshot", editor.store.getSnapshot())
        
    }

    function extractUserKeywords(snapshot){
        const keywords = {}
        keywords["userKy"] = []
        keywords["llmKy"] = []
        keywords["omitKy"] = []
        for (var item in snapshot.store){
            if(snapshot.store[item].type === "xx_html"){
                const hl = snapshot.store[item].props.highlight;
                const chl = snapshot.store[item].props.commonhl;
                const llmky = snapshot.store[item].props.llmhighlight;
                const omitky = snapshot.store[item].props.omithl;

                hl.forEach((word) => {
                    if (!keywords["userKy"].includes(word)){
                        keywords["userKy"].push(word)
                    }
                })

                chl.forEach((word) => {
                    if (!keywords["userKy"].includes(word)){
                        keywords["userKy"].push(word)
                    }   
                })

                llmky.forEach((word) => {
                    if (!keywords["llmKy"].includes(word)){
                        keywords["llmKy"].push(word)
                    }
                })

                omitky.forEach((word) => {
                    if (!keywords["omitKy"].includes(word)){
                        keywords["omitKy"].push(word)
                    }
                })

                // keywords["userKy"] = keywords["userKy"].concat(hl);
                // keywords["userKy"] = keywords["userKy"].concat(chl);
                // keywords["llmKy"] = keywords["llmKy"].concat(llmky);
                // keywords["omitKy"] = keywords["omitKy"].concat(omitky);
            }
        }
        // console.log(`[${current()}]`+ "[Space2Think] keywords", keywords)
        return keywords
    }


    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(menuOpen);
    React.useEffect(() => {
        if (prevOpen.current === true && menuOpen === false) {
        anchorRef.current.focus();
        }

        prevOpen.current = menuOpen;
    }, [menuOpen]);
    
    const prevOpenS = React.useRef(sMenuOpen);
    React.useEffect(() => {
        if (prevOpenS.current === true && sMenuOpen === false) {
        anchorRef.current.focus();
        }

        prevOpenS.current = sMenuOpen;
    }, [sMenuOpen]);


    function getCamera(){
        return editor?.getCamera();
    }
        
    // }, [reportOpen]);

    useEffect(() => {
        // show all docs contain the searched words
        // highlight those words in the docs - no highlight
        // make the camera move for all the docs - another function
        if (snapshot !== null && snapshot !== undefined){
            if (search !== ''){
                let searchedDoc = [];
                //console.log(`[${current()}]`+ "[Space2Think] search", search);
                for (var item in snapshot.store){
                    if(snapshot.store[item].type === "xx_html"){
                        const id = item;
                        const content = snapshot.store[item].props.content.toLowerCase();
                        const str = search.toLowerCase();
                        const name = snapshot.store[item].props.label;
                        let positionX = snapshot.store[item].x;
                        let positionY = snapshot.store[item].y;
                        
                        if (snapshot.store[item].parentId !== null && snapshot.store[item].parentId !== undefined){
                            positionX = snapshot.store[snapshot.store[item].parentId].x + snapshot.store[item].x;
                            positionY = snapshot.store[snapshot.store[item].parentId].y + snapshot.store[item].y;
                        }
                        if (content.includes(str)){
                            var searchItem = {};
                            const position = content.indexOf(str);
                            const length = str.length;
                            const rest = parseInt((30 - length)/2, 10);
                            searchItem = {
                                "id": id, 
                                "content": "..." + content.substring(position-rest, position+rest) + "...",
                                "name": name,
                                "positionX": positionX,
                                "positionY": positionY,
                            }
                            // console.log(`[${current()}]`+ "[Space2Think] searchItem position", searchItem.positionX, searchItem.positionY)
                            searchedDoc.push(searchItem);
                        }
                    }
                }
                setSearchResult(searchedDoc);   
                // console.log(`[${current()}]`+ "[Space2Think] searchedDoc", searchedDoc)         
            }
        }
    }, [search]);

    useEffect(() => {
        if (!sMenuOpen){
            setSearch('');
            setSearchResult([]);
        }
    }, [sMenuOpen]);

    useEffect(() => {
        let x = 0;
        let y = 0;
        if (snapshot !== null && snapshot !== undefined && curClickedNodeKey !== null && curClickedNodeKey !== undefined){
            if (curClickedNodeKey.includes('shape')) {
                // section node
                // console.log(`[${current()}]`+ "[Space2Think] curClickedNodeKey is frame", curClickedNodeKey)
                for (var item in snapshot.store){
                    if(snapshot.store[item].type==="frame" && snapshot.store[item].id === curClickedNodeKey){
                        x = snapshot.store[item].x;
                        y = snapshot.store[item].y;
                        const w = snapshot.store[item].props.w;
                            
                        let ratio = 600 / w;
                        ratio = ratio.toFixed(2);

                        editor?.setCamera({ x: -x+200, y: -y+200, z: 1*ratio}, { duration: 500, easing: (t) => t * t });
                        break;
                    }
                }
                editor?.select(curClickedNodeKey);
            }else if (curClickedNodeKey.includes('_')) {
                // citation node
                // console.log(`[${current()}]`+ "[Space2Think] curClickedNodeKey is document", curClickedNodeKey)
                for (var item in snapshot.store){
                    if(snapshot.store[item].type === "xx_html" && snapshot.store[item].props.label === curClickedNodeKey){
                        // console.log(`[${current()}]`+ "[Space to Think] item", snapshot.store[item])
                       
                        const parentId = snapshot.store[item].parentId;
                        
                        const x1 = snapshot.store[item].x;
                        const y1 = snapshot.store[item].y;

                        // x = snapshot.store[parentId].x;
                        // y = snapshot.store[parentId].y;
                        
                        if (snapshot.store[parentId].parentId !== null && snapshot.store[parentId].parentId !== undefined){
                            x = snapshot.store[parentId].x + x1;
                            y = snapshot.store[parentId].y + y1;
                        }
                        else{
                            x = x1;
                            y = y1;
                        }
                        // console.log(`[${current()}]`+ "[Space to Think] x", x, "y", y)
                        if (reportOpen) {
                            editor?.setCamera({ x: -x+200, y: -y+300, z: 1 }, { duration: 500, easing: (t) => t * t });
                        }
                        else {
                            editor?.setCamera({ x: -x+400, y: -y+300, z: 1 }, { duration: 500, easing: (t) => t * t });
                        }
                        
                        editor?.select(snapshot.store[item].id);
                        break;
                    }
                }
            }
            else if (curClickedNodeKey=="blank"){

                for (var item in snapshot.store){
                    if (snapshot.store[item].type === "xx_html")
                    {
                        editor?.updateShape({
                            id: snapshot.store[item].id,
                            type: 'xx_html',
                            props: {
                                ...snapshot.store[item].props,
                                selectedhl: [],
                            }
                        })
                    }
                }
                // console.log("[Space2Think] after blank click: snapshot", snapshot.store)
                editor?.selectNone();
                // remove all classes
            }
            else{
                // normal node
                // entity is selected
                // console.log(`[${current()}]`+ "[Space2Think] curClickedNodeKey is entity", curClickedNodeKey)
                // console.log(`[${current()}]`+ "[Space2Think] allKeywords", keywords)
                let doc = null;
                let label = null;
                for (var item in keywords){
                    if(keywords[item].hasOwnProperty(curClickedNodeKey)){
                        // console.log(`[${current()}]`+ "[Space to Think] keyword: type and keyword: ", item, "curClickedNodeKey", curClickedNodeKey);
                        // console.log(`[${current()}]`+ "[Space to Think] the doc includes this keyword: ", keywords[item][curClickedNodeKey])
                        doc = keywords[item][curClickedNodeKey];
                        label = item;
                        break;
                    }
                }
                
                let shapes = {};
                let weirdId = null;
                // console.log(`[${current()}]`+ "[Space2Think] the doc entity is in:", doc)
                if (doc){
                    for (var item in snapshot.store){
                        if(snapshot.store[item].type === "xx_html" ){
                            
                            if (doc.includes(snapshot.store[item].props.label)){
    
                                // console.log(`[${current()}]`+ "[Space2Think] the doc label", snapshot.store[item].props.label)
                                // console.log(`[${current()}]`+ "[Space2Think] the doc's space item", snapshot.store[item])
                                const selectedhl = [curClickedNodeKey];
    
                                editor?.updateShape({
                                    id: snapshot.store[item].id,
                                    type: 'xx_html',
                                    parentId: snapshot.store[item].parentId,
                                    x: snapshot.store[item].x,
                                    y: snapshot.store[item].y,
                                    props: {
                                        ...snapshot.store[item].props,
                                        selectedhl: selectedhl,
                                    }
                                })
                                // console.log(`[${current()}]`+ "[Space2Think] the doc's updated space item", snapshot.store[item])
                                shapes[snapshot.store[item].id] = {};
                                shapes[snapshot.store[item].id].x = snapshot.store[item].x;
                                shapes[snapshot.store[item].id].y = snapshot.store[item].y;
                                let parentId = snapshot.store[item].parentId;
                                // console.log(`[${current()}]`+ "[Space to Think] parentId", parentId)
                                if (parentId !== "page:page"){
                                    shapes[snapshot.store[item].id].parent = parentId;
                                    shapes[snapshot.store[item].id].parentX = snapshot.store[parentId].x;
                                    shapes[snapshot.store[item].id].parentY = snapshot.store[parentId].y;
                                    shapes[snapshot.store[item].id].parentW = snapshot.store[parentId].props.w;
                                    shapes[snapshot.store[item].id].parentH = snapshot.store[parentId].props.h;
                                }else{
                                    shapes[snapshot.store[item].id].parent = parentId;
                                    shapes[snapshot.store[item].id].parentX = 0;
                                    shapes[snapshot.store[item].id].parentY = 0;
                                    shapes[snapshot.store[item].id].parentW = 0;
                                    shapes[snapshot.store[item].id].parentH = 0;
                                }
                                weirdId = item;                          
                            }
                            else {
                                editor?.updateShapes([{
                                    id: snapshot.store[item].id,
                                    type: 'xx_html',
                                    props: {
                                        ...snapshot.store[item].props,
                                        selectedhl: [],
                                    }
                                }])
                            
                            }
                        }
                    }
                    // console.log(`[${current()}]`+ "[Space to Think] updated shapes after2 ", snapshot.store[weirdId])
                    
    
                    if(Object.keys(shapes).length==1){
                        // console.log(`[${current()}]`+ "[Space2think] one keyword in one document")
                        const id = Object.keys(shapes)[0];
                        let x = shapes[id].x;
                        let y = shapes[id].y;
                        let x1 = shapes[id].parentX;
                        let y1 = shapes[id].parentY;
                        editor?.setCamera({ x: -x-x1+200, y: -y-y1+300, z: 0.8 }, { duration: 500, easing: (t) => t * t });
                        editor?.select(id);
                    }
                    else if (Object.keys(shapes).length>1){
                        // console.log(`[${current()}]`+ "[Space2think] one keyword in different documents")
                        let parent = {}
    
                        for (var item in shapes){
                            if(!parent.hasOwnProperty(shapes[item].parent)){
                                parent[shapes[item].parent] = [shapes[item].parentX, shapes[item].parentY, shapes[item].parentW, shapes[item].parentH]
                            }
                        }
                        // console.log(`[${current()}]`+ "[Space2think] the keyword's parents", parent)
    
                        // same parent
                        if (Object.keys(parent).length == 1){
                            let x = 0;
                            let y = 0;
                            let ratio = 1;
                            for (var item in parent){
                                x = parent[item][0];
                                y = parent[item][1];
    
                                // console.log(`[${current()}]`+ "[Space to Think] only one parent: parent position", "x", x, "y", y)
                                
                                // console.log(`[${current()}]`+ "[Space to Think] only one parent: parent width", parent[item][2])
                                
                                ratio = 600 / parent[item][2];
                                ratio = ratio.toFixed(2);
    
                                editor?.setCamera({ x: -x+200, y: -y+200, z: 1*ratio}, { duration: 500, easing: (t) => t * t });
                                editor?.select(...Object.keys(shapes));
                            }
                        }else if (Object.keys(parent).length > 1){
                            // different parents
                            // console.log(`[${current()}]`+ "[Space2think] one keyword in different clusters")
                            let minX = 100000;
                            let maxX = 0;
                            let minY = 100000;
                            let maxY = 0;
                            for (var item in parent){
                                if (parent[item][0] < minX){
                                    minX = parent[item][0];
                                }
                                if (parent[item][1] < minY){
                                    minY = parent[item][1];
                                }
                                if (parent[item][0] + parent[item][2] > maxX){
                                    maxX = parent[item][0] + parent[item][2];
                                }
                                if (parent[item][1] + parent[item][3] > maxY){
                                    maxY = parent[item][1] + parent[item][3];
                                }
                            }
                            const dist = maxX - minX;
                            let ratio = 600 / dist;
                            ratio = ratio.toFixed(2);
                            // console.log("[Space to Think] different parents: min and max", "minX", minX, "maxX", maxX, "minY", minY, "maxY", maxY, "ratio", ratio)
                            editor?.setCamera({ x: -minX, y: -minY, z: 1*ratio }, { duration: 500, easing: (t) => t * t });
                            editor?.select(...Object.keys(shapes));
                        }
                    }
                }
                
    
            }
        }
        
        // Handle window resize
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };

        const handleSelectionChange = () => {
            const selection = window.getSelection();
            setSelectedText(selection.toString());
        };
      
        window.addEventListener('resize', handleResize);
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
        

    }, [curClickedNodeKey]);

    useEffect(() => {
        const currentSelected = editor?.getSelectedShapeIds();
        // console.log(`[${current()}]`+ "[Space2think] currentSelected shapeid:", currentSelected)
        if (currentSelected !== null && currentSelected !== undefined && Object.keys(snapshot.store).length > 2 && currentSelected.length ===1){
            if (snapshot.store[currentSelected[0]]!==undefined){
                if (snapshot.store[currentSelected[0]].type==="xx_html"){
                    const label = snapshot.store[currentSelected[0]].props.label;
                    dispatch(setSelectedId(label));
                    // console.log(`[${current()}]`+ "[Space2think] document is selected", label)
                    // console.log(`[${current()}]`+ "[Space2think] dispatch selected document label", label)
                }
                else if (snapshot.store[currentSelected[0]].type==="frame"){
                    const id = currentSelected[0];
                    dispatch(setSelectedId(id));
                    // console.log(`[${current()}]`+ "[Space2think] frame (id) is selected", id)
                    // console.log(`[${current()}]`+ "[Space2think] dispatch selected frame id", id)
                }
            }
            else{
                // console.log(`[${current()}]`+ "[Space2think] clicked one deleted shape in report")
            }
        }
        else if (currentSelected && currentSelected.length===0){
            // console.log(`[${current()}]`+ "[Space2think] dispatch selected blank")
            // console.log(`[${current()}]`+ "[Space2think] selected blank")
            dispatch(setSelectedId(null));
        }
        // if (snapshot){// console.log(`[${current()}]`+ "[Space2think] snapshot getselectedshapeIds", JSON.stringify(snapshot))}
    },[editor?.getSelectedShapeIds()])

    useEffect(() => {
        let selectedWord = "";
        const llmHighlights = document.querySelectorAll('llmhighlight');

        llmHighlights.forEach(element => {
            element.addEventListener('mousedown', function(event) {
                if(element.textContent!=''){
                    selectedWord = element.textContent;
                    // console.log(`[${current()}]`+ "[Space2Think] selectedWord", selectedWord);
                    dispatch(setSelectedEntity(selectedWord));
                    // dispatch(setCurClickedNodeKey(selectedWord));
                    event.stopPropagation();
                }
                
            });
        });

        const commonhls = document.querySelectorAll('commonhl');

        commonhls.forEach(element => {
            element.addEventListener('mousedown', function(event) {
                if(element.textContent!=''){
                    selectedWord = element.textContent;
                    // console.log(`[${current()}]`+ "[Space2Think] selectedWord", selectedWord);
                    dispatch(setSelectedEntity(selectedWord));
                    event.stopPropagation();
                    // dispatch(setCurClickedNodeKey(selectedWord));
                }
            });
        });
                                        
        },[snapshot]);

    // }, 

    useEffect(() => {
        // dispatch(setCurClickedNodeKey(selectedEntity))
        if (selectedEntity !== null && selectedEntity !== undefined && selectedEntity !== ""){
            // console.log(`[${current()}]`+ "[Space2Think] selectedEntity", selectedEntity);
            const selectedhl = [selectedEntity];
            if (snapshot !== null && snapshot !== undefined){
                for (var item in snapshot.store){
                    if(snapshot.store[item].type === "xx_html" ){
                        const commonhl = snapshot.store[item].props.commonhl;
                        const llmhighlight = snapshot.store[item].props.llmhighlight;
                        if (commonhl.includes(selectedEntity)||llmhighlight.includes(selectedEntity)){
                            // console.log(`[${current()}]`+ "[Space2Think] selectedWord3", selectedEntity, "item", snapshot.store[item])
                            editor?.updateShape({
                                id: snapshot.store[item].id,
                                type: 'xx_html',
                                props: {
                                    ...snapshot.store[item].props,
                                    selectedhl: selectedhl,
                                }
                            })
        
                        }
                        else{
                            editor?.updateShapes([{
                                id: snapshot.store[item].id,
                                type: 'xx_html',
                                props: {
                                    ...snapshot.store[item].props,
                                    selectedhl: [],
                                }
                            }])
                        
                        }
                    }
                }
            }
        }
    }, [selectedEntity]);
 
    const handleGenerateReport = async () => {
        const apiKeyInput = document.getElementById('openai_key_risky_but_cool');
        if (!apiKeyInput || !apiKeyInput.value) {
            setApiKeyError('');  // Clear any previous errors
            setApiKeyDialogOpen(true);
            return;
        }
        
        setLoading(true);
        setReportFinish(false);
        let generatedReport = "";
        try {
            let snapshot = editor?.store.getSnapshot();
            let ifhaveFrame = false;
            for (var item in snapshot.store){
                if (snapshot.store[item].type === "frame"){
                    ifhaveFrame = true;
                    break;
                }
            }
            if (ifhaveFrame){
                // console.log(`[${current()}]`+ "[Space2Think] Enter into the refined report generation");
                // console.log(`[${current()}]`+ "[Space2Think] snapshot for generation", snapshot);
                generatedReport = await reportGeneration(editor?.store.getSnapshot(), taskDescription, introduction, clusterDescription, conclusion);
                reportToClusterName(editor, generatedReport);
                keywordsToST(editor, generatedReport);
                const UserKy = extractUserKeywords(editor?.store.getSnapshot());
                dispatch(setUserKeywords(UserKy));
                const preReport = report;
                dispatch(setReport(generatedReport));
                dispatch(setReportOpen());
                setLoading(false);
                setReportFinish(true);
            } else {
                // console.log(`[${current()}]`+ "[Space2Think] Enter into the initial report generation");
                const blankReport = await reportGenerationBlank(editor?.store.getSnapshot(), taskDescription, introduction, clusterDescription, conclusion);
                generatedReport = await reportToSpace(editor, blankReport);
                keywordsToST(editor, generatedReport);
                const UserKy = extractUserKeywords(editor?.store.getSnapshot());
                dispatch(setUserKeywords(UserKy));
                setLoading(false);
                setReportFinish(true);
            }
            // console.log(`[${current()}]`+ "[Space2Think] generated report:", generatedReport);
            setApiKeyError(''); // Clear any previous errors on success
        } catch (error) {
            console.error(`[${current()}]`+ "[Space2Think] Error generating report:", error);
            setLoading(false);
            
            // Check if the error is related to the API key
            if (error.message?.includes('API key') || 
                error.message?.includes('Invalid authentication') ||
                error.message?.includes('Incorrect API key') ||
                error.message?.includes('auth')) {
                setApiKeyError(error.message);
                setApiKeyDialogOpen(true);
                // Remove the invalid API key
                const apiKeyInput = document.getElementById('openai_key_risky_but_cool');
                if (apiKeyInput) {
                    apiKeyInput.value = '';
                }
            }
        }
    };

    function jsonDocUpload(e, editor) {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) {
                    throw new Error('Uploaded file must contain an array of documents');
                }
                
                // Validate document format
                data.forEach(doc => {
                    if (!doc.label || !doc.content) {
                        throw new Error('Each document must have label and content properties');
                    }
                });

                // Convert documents to shapes
                const shapes = data.map(doc => ({
                    type: 'xx_html',
                    x: 120,
                    y: 120,
                    props: {
                        w: 500,
                        h: 300,
                        label: doc.label,
                        content: doc.content,
                        highlight: [],
                        llmhighlight: [],
                        commonhl: [],
                        omithl: [],
                        selectedhl: [],
                        editing: false,
                    }
                }));

                // Clear existing shapes and create new ones
                editor?.selectAll();
                editor?.deleteShapes(editor?.getSelectedShapeIds());
                editor?.createShapes(shapes);
                editor?.selectAll();
                editor?.packShapes(editor?.getSelectedShapeIds(), 30);
                editor?.selectNone();
                
                // console.log(`[${current()}]`+ "[Space2Think] Uploaded documents", data);
            } catch (error) {
                console.error(`[${current()}]`+ "[Space2Think] Error uploading documents:", error);
                alert('Error uploading documents: ' + error.message);
            }
        };
    }

    useEffect(() => {
        if (editor) {
            handleGenerateReport();
        }
        // Optionally, you can add a check for API key input here if you want to avoid the dialog on load
        // const apiKeyInput = document.getElementById('openai_key_risky_but_cool');
        // if (apiKeyInput && apiKeyInput.value) {
        //     handleGenerateReport();
        // }
    }, [editor]);

    return (
        <Box>
            <AppBar position="fixed" open={reportOpen}>            
                <div className='toolbar-wrapper'>
                    <div className='toolbar'>
                        <Tooltip title='Files' placement='top'>
                        <button
                            className='toolbar-item'
                            ref={anchorRef}
                            id="composition-button"
                            aria-controls={menuOpen ? 'composition-menu' : undefined}
                            aria-expanded={menuOpen ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleToggle}
                            style={{ color: '#8a817c' }}
                            >
                                <FileOpenOutlinedIcon/>
                                {/* <i className='format files' /> */}
                                {/* Datasets */}
                        </button>
                        </Tooltip>
                        <Popper
                            open={menuOpen}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            placement="bottom-start"
                            transition
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                                }}
                                >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList
                                        autoFocusItem={menuOpen}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                        onKeyDown={handleListKeyDown}
                                    >
                                        <MenuItem onClick={()=>{
                                            editor?.selectAll()
                                            editor?.deleteShapes(editor?.getSelectedShapeIds())
                                            editor?.createShapes(tutorial)
                                            editor?.selectAll()
                                            editor?.packShapes(editor?.getSelectedShapeIds(), 30)
                                            editor?.selectNone()
                                            dispatch(setReport(''))
                                            handleClose()
                                        }}>tutorial</MenuItem>
                                        <MenuItem onClick={()=>{
                                            editor?.selectAll()
                                            editor?.deleteShapes(editor?.getSelectedShapeIds())
                                            editor?.createShapes(lr)
                                            editor?.selectAll()
                                            editor?.packShapes(editor?.getSelectedShapeIds(), 30)
                                            editor?.selectNone()
                                            dispatch(setReport(''))
                                            handleClose()
                                        }}>literature review sample</MenuItem>
                                        <MenuItem 
                                            component="label"
                                            role={undefined}
                                            variant="contained"
                                            tabIndex={-1}
                                        >
                                            Upload snapshot
                                            <VisuallyHiddenInput id="fileInput"
                                                type="file"
                                                onChange={(event)=>{
                                                    dispatch(setReport(''));
                                                    const fileReader = new FileReader();
                                                    fileReader.readAsText(event.target.files[0], "UTF-8");
                                                    fileReader.onload = (event) => {
                                                        const snapshotData = JSON.parse(event.target.result);
                                                        // console.log(`[${current()}]`+ "[Space2Think] Uploaded Json Data", snapshotData);
                                                        localStorage.setItem('my-editor-snapshot', JSON.stringify(snapshotData));
                                                        const stringified = localStorage.getItem('my-editor-snapshot');
                                                        const snapshot = JSON.parse(stringified);
                                                        editor?.store.loadSnapshot(snapshot);
                                                    };
                                                    handleClose();
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem 
                                            component="label"
                                            role={undefined}
                                            variant="contained"
                                            tabIndex={-1}
                                        >
                                            Upload documents
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept=".json"
                                                onChange={(event) => {
                                                    dispatch(setReport(''));
                                                    jsonDocUpload(event, editor);
                                                    handleClose();
                                                }}
                                            />
                                        </MenuItem>
                                    </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                                </Grow>
                            )}
                        </Popper>
                    <Tooltip title='Save Draft' placement='top'>
                        <button
                        className='toolbar-item'
                        aria-label='Save Draft'
                        onClick={() => {
                            snapshot.current = editor?.store.getSnapshot()
                            const stringified = JSON.stringify(snapshot)
                            // console.log(`[${current()}]`+ "[Space to Think] saved snapshot", stringified)
                            saveSnapshot(stringified)
                        }}
                        >
                        <i className='format save' />
                        </button>
                    </Tooltip>
                    <Divider />
                    <Tooltip title='Search' placement='top'>
                        <Button
                            className='toolbar-item'
                            style={{ color: '#8a817c' }} 
                            onClick={() => 
                                {
                                    handleSToggle();
                                }
                            }>
                                <SearchIcon />
                                Search
                        </Button>
                    </Tooltip>
                    <Popper
                            open={sMenuOpen}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            placement="bottom-end"
                            transition
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                    placement === 'bottom-end' ? 'left bottom' : 'left top',
                                }}
                                >
                                <Paper>
                                    <Box>
                                    <ClickAwayListener onClickAway={handleSClose}>
                                    <MenuList 
                                        autoFocusItem={sMenuOpen}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                        // onKeyDown={handleListKeyDown}
                                    >
                                        <MenuItem >
                                        <TextField 
                                            id="search" 
                                            // label="Search field" 
                                            placeholder='Search field'
                                            // variant="filled" 
                                            onClick={(event) => event.stopPropagation()}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                        <SearchIcon /> 
                                            {/* <button>Search</button> */}
                                            {/* <Button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    console.log(search);
                                                    }}>
                                                     Search
                                            </Button> */}
                                        </MenuItem>
                                         </MenuList>
                                         </ClickAwayListener>
                                    </Box>
                                    <Box style={{maxHeight: '400px', overflowY: 'auto'}}>
                                    {/* <ClickAwayListener onClickAway={handleSClose}> */}
                                        <MenuList >
                                            {/* 
                                            > */}
                                            {searchResult.map((item) => (
                                                <MenuItem 
                                                style = {{color: 'green'}}
                                                onClick={(event) => {
                                                    // console.log(`[${current()}]`+ "[Space2Think] clicked item from search")
                                                    event.stopPropagation()
                                                    dispatch(setCurClickedNodeKey(item.name))
                                                    // handleSOpen();
                                                    // console.log("[Space2Think] item position", item.positionX, item.positionY)
                                                    // editor?.setCamera({ x: -1*searchResult.positionX+200, y: -1*searchResult.positionY+300, z: 0.5 }, { duration: 500, easing: (t) => t * t });
                                                    // editor?.select(item.id);
                                                    // console.log("[Space2Think] camera", editor?.cameraX, editor?.cameraY, editor?.cameraZ)
                                                }}
                                                >
                                                {item.name}: {item.content}
                                                </MenuItem>
                                            ))}
                                            {/* <MenuItem onClick={()=>{}}>Crescent</MenuItem> */}
                                        </MenuList>
                                    {/* </ClickAwayListener> */}
                                    </Box>
                                    
                                </Paper>
                                </Grow>
                            )}
                        </Popper>
                    <Divider />
                    <Tooltip title='Prompt' placement='top'>
                        <Button
                            className='toolbar-item'
                            style={{ color: '#8a817c' }} 
                            onClick={() => {
                                dispatch(setPromptOpen(true))
                                }
                            }>
                                <NotesIcon />
                                Prompt
                        </Button>
                    </Tooltip>
                    <Divider />
                    <Tooltip title='Generate report' placement='top'>
                        <Button
                            className='toolbar-item'
                            style={{ color: '#8a817c' }}
                            onClick={handleGenerateReport}
                        >
                            <i className='format chatgpt' />
                            Generate
                        </Button>
                    </Tooltip>
                    </div>
                    <div className='toolbar-right'>
                        {!reportOpen ? (
                            <Tooltip title='Show report' placement='top'>
                            <Button
                                className='toolbar-item'
                                style={{ color: '#8a817c' }}
                                onClick={() => {
                                    dispatch(setReportOpen())
                                    console.log(`[${current()}]`+ "[Space2Think] reportOpen")
                                }}
                            >
                                <ArrowCircleLeftOutlinedIcon />
                            </Button>
                            </Tooltip>
                        ) : (
                            <Tooltip title='Hide report' placement='top'>
                            <Button
                                className='toolbar-item'
                                style={{ color: '#8a817c' }}
                                onClick={() => {
                                    dispatch(setReportClose())
                                    console.log(`[${current()}]`+ "[Space2Think] reportHide")
                                }}
                            >
                                <ArrowCircleRightOutlinedIcon />
                            </Button>
                            </Tooltip>
                        )}
                        </div>
                </div>
            </AppBar>
            <Snackbar
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                open={loading}
                severity="info"
                autoHideDuration={600}
                message="LLM is working..."
                >
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                open={reportFinish}
                autoHideDuration={600}
                onClose={() => setReportFinish(false)}
                >
                <Alert serverity="success"> LLM Generation Done </Alert>
            </Snackbar>
            <PromptsDialog
                id="customized-dialog-title"
                open={promptOpen}
                onClick={() => {
                    dispatch(setPromptOpen(false))
                    }}
            />
            <ApiKeyDialog 
                open={apiKeyDialogOpen}
                onClose={() => {
                    setApiKeyDialogOpen(false);
                    setApiKeyError('');
                }}
                error={apiKeyError}
            />
            <Main open={reportOpen}>
                <div className='editor_space' style={{ height: `${windowHeight-45}px`}}>
                    <Tldraw 
                        // hideUi
                        shapeUtils={customShape}
                        components={MenuComponents}
                        onMount={(editor) => setEditor(editor)}
                    >
                        <CustomUi />
                        
                    </Tldraw>
                </div>
            </Main>
            <Drawer
                sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth
                }
                }}
                variant='persistent'
                anchor='right'
                open={reportOpen}
            >
                    <ReportEditor />

            </Drawer>
        </Box>
    
    );
}
