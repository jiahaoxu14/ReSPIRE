import React from "react";
import { useEffect } from 'react'
import { Tldraw, track, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import './custom-ui.css'
import {Box, Button, Stack, Typography, Tooltip} from '@mui/material';
import BackHandOutlinedIcon from '@mui/icons-material/BackHandOutlined';
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import CropFreeIcon from '@mui/icons-material/CropFree';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { current } from "../LexicalEditor/time";

const CustomUi = track(() => {
	const editor = useEditor()
    // console.log("uieditor", editor)

	useEffect(() => {
		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Delete': break
				case 'Backspace': {
					// editor.deleteShapes(editor.getSelectedShapeIds())
					// break
				}
                case 'x':
				case 'p':
				case 'b':
                case 'a':
                case 'f':
                case 'n':
                case 'e': 
                case 'd':
                case 'i':
                case 'o':
                case 's':
                case 't':
                case 'u':
                case 'v':
                case 'w':
                case 'y':
                case 'z': 
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'Enter':
                case 'Escape':
                case 'Tab':
                case 'Shift':

			}
		}

		window.addEventListener('keyup', handleKeyUp)
		return () => {
			window.removeEventListener('keyup', handleKeyUp)
		}
	})

	return (
		<div className="custom-layout">
			<div className="custom-toolbar">
                <Tooltip title='Select' placement='bottom'>
                    <button
                        className="custom-button"
                        data-isactive={editor.getCurrentToolId() === 'select'}
                        onClick={() => {
                            editor.setCurrentTool('select');
                            console.log(`[${current()}]` + "[CustomUI] select button clicked");
                        }}
                    >
                        <NorthWestIcon />
                    </button>
                </Tooltip>
                <Tooltip title='Hand' placement='bottom'>
                    <button
                    className="custom-button"
                    aria-label="PanTool"
                    data-isactive={editor.getCurrentToolId() === 'hand'}
                    onClick={() => {
                        editor.setCurrentTool('hand')
                        console.log(`[${current()}]` + "[CustomUI] hand button clicked");
                    }}
                    >
                    <BackHandOutlinedIcon />
                    </button>
                </Tooltip> 
                <Tooltip title='Arrow' placement='bottom'>
                   <button
                        className="custom-button"
                        data-isactive={editor.getCurrentToolId() === 'arrow'}
                        onClick={() => {
                            editor.setCurrentTool('arrow');
                            console.log(`[${current()}]` + "[CustomUI] arrow button clicked");
                        }}                  >
                        <CallMadeOutlinedIcon />
                        {/* Arrow */}
                    </button>
                </Tooltip>
                <Tooltip title='Frame' placement='bottom'>
                    <button
                        className="custom-button"
                        data-isactive={editor.getCurrentToolId() === 'frame'}
                        onClick={() => {
                            editor.setCurrentTool('frame');
                            console.log(`[${current()}]` + "[CustomUI] frame button clicked");
                        }}
                    >
                        <CropFreeIcon />
                        {/* Frame */}
                    </button>
                </Tooltip>
                <Tooltip title='Note' placement='bottom'>
                    <button
                        className="custom-button"
                        data-isactive={editor.getCurrentToolId() === 'note'}
                        onClick={() => {
                            editor.setCurrentTool('note')
                            console.log(`[${current()}]` + "[CustomUI] note button clicked");
                        }}
                    >
                        <EditNoteIcon />
                        {/* Note */}
                    </button>
                </Tooltip>
                <Tooltip title='Eraser' placement='bottom'>
                    <button
                        className="custom-button"
                        data-isactive={editor.getCurrentToolId() === 'eraser'}
                        onClick={() => {
                            editor.setCurrentTool('eraser')
                            console.log(`[${current()}]` + "[CustomUI] eraser button clicked");
                        }}
                    >
                        <BackspaceIcon />
                        {/* Eraser */}
                    </button> 
                </Tooltip>
                
			</div>
		</div>
	)
})

export default CustomUi;