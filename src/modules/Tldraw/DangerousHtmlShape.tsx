import React from "react";
import {
	Geometry2d,
	HTMLContainer,
	Rectangle2d,
	ShapeProps,
	ShapeUtil,
	T,
	TLBaseShape,
	TLOnResizeHandler,
	Tldraw,
	resizeBox,
    BaseBoxShapeUtil,
	useIsEditing,
	TLOnDoubleClickHandleHandler,
	TLOnEditEndHandler
} from 'tldraw'
import {
	Box,
	Typography,
	Avatar,
	Stack,
	Grid,
	IconButton,
	Tooltip,
	TextField,
	ListItemButtonProps,
	Button
  } from '@mui/material'
import 'tldraw/tldraw.css'
import {
    useDispatch,
    useSelector
} from 'react-redux';
import {
    setHighlightDoc
} from '../LexicalEditor/slices/SpaceSlice.js'
import { current } from '../LexicalEditor/time.js';

type IDangerousHtmlShape = TLBaseShape<
	'xx_html',
	{
		w: number
		h: number
		label: string
		content: string
		highlight: Array<string>
		llmhighlight: Array<string>
		commonhl: Array<string>
		omithl: Array<string>
		selectedhl: Array<string>
		editing: boolean
	}
>

function highlightText(content, highlights, llmhighlights, commonhls, omithls, selectedhls, shape) {
	let updatedContent = content;
  
	// Iterate through each string in the highlights array
	highlights.forEach((highlight) => {
	  // Use a regular expression to find all instances of the highlight text
	  // We use 'gi' for global and case-insensitive matching
	  const regex = new RegExp(`${highlight}`, 'gi');
	  // Replace each instance with the wrapped version in a highlight tag
	  updatedContent = updatedContent.replace(regex, `<highlight style='user-select: text'>${highlight}</highlight>`);
	});

	// Iterate through each string in the highlights array
	llmhighlights.forEach((llmhighlight) => {
		const regex = new RegExp(`\\b${llmhighlight}\\b`, 'gi');
		if (selectedhls !== null && selectedhls !== undefined && selectedhls.includes(llmhighlight)){
			updatedContent = updatedContent.replace(regex, `<llmhighlight style='user-select: text' class='selectedhl' onclick='console.log("I am clicked")'>${llmhighlight}</llmhighlight>`);
		}
		else{
			updatedContent = updatedContent.replace(regex, `<llmhighlight style='user-select: text' onclick='console.log("I am clicked")'>${llmhighlight}</llmhighlight>`);
		}
	});

	commonhls.forEach((commonhl) => {
		const regex = new RegExp(`\\b${commonhl}\\b`, 'gi');
		if (selectedhls !== null && selectedhls !== undefined && selectedhls.includes(commonhl)){
			updatedContent = updatedContent.replace(regex, `<commonhl style='user-select: text' class='selectedhl' >${commonhl}</commonhl>`);
		}
		else{
			updatedContent = updatedContent.replace(regex, `<commonhl >${commonhl}</commonhl>`);
		}
	  });

	omithls.forEach((omithl) => {
		const regex = new RegExp(`\\b${omithl}\\b`, 'gi');
		updatedContent = updatedContent.replace(regex, `<omithl style='user-select: text'>${omithl}</omithl>`);
	});

	return updatedContent;
  }

export class DangerousHtmlUtil extends ShapeUtil<IDangerousHtmlShape> {
	static override type = 'xx_html' as const

	override getDefaultProps() {
		return {
			type: 'xx_html',
			w: 400,
			h: 300,
			label: '',
			content: '',
			highlight: [], 
			llmhighlight: [],
			commonhl: [],
			omithl: [],
			selectedhl: [],
			editing: false,
		}
	}

    override canBind = () => true
	override canEdit = () => true
	override canResize = () => true
	override isAspectRatioLocked = () => false
	// override canScroll = () => true

	component(shape: IDangerousHtmlShape) {
		return (
			<HTMLContainer id={shape.id} className="doc_container"
				style={{ 
					overflow: 'auto', 
					backgroundColor: '#ffffff',
					padding: '10px', 
					borderRadius: '15px', 
					boxShadow: '6px 6px 2px 1px rgba(100, 100, 100, 0.5)',
					border: '.2px solid black',
					width: `${shape.props.w}px`,
					height: `${shape.props.h}px`,
					display: 'flex',
					flexDirection: 'column'
				}}>
				<Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
					<div className="doc_title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography variant='body1' style={{ fontSize: 20 }}>
							{shape.props.label}
						</Typography>
					</div>
					<div 
						className="nodrag"
						dangerouslySetInnerHTML={{ __html: highlightText(shape.props.content, shape.props.highlight, shape.props.llmhighlight, shape.props.commonhl, shape.props.omithl, shape.props.selectedhl, shape)}} 
						style={{
							overflow: 'auto',
							flex: 1,
							fontSize: 'calc(13px + 0.1vw)', 
							textAlign: 'left',
							pointerEvents: 'all',
							fontFamily: 'Arial, Helvetica, sans-serif',
							userSelect: this.editor.getSelectedShapeIds().includes(shape.id)? 'text':'none',
						}}>
					</div>
				</Box>
			</HTMLContainer>
		)
	}

	getGeometry(shape: IDangerousHtmlShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	indicator(shape: IDangerousHtmlShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	override onDoubleClick = (shape:IDangerousHtmlShape) => {
		console.log(`[${current()}]`+ '[DangerousHtml]Double click', shape.props.label)
		this.editor.setCursor({type: 'text', rotation: 0});
		this.editor.updateShapes([
			{
				type: shape.type,
				id: shape.id,
				props: {
					...shape.props,
					editing: true,
				},
			},
		])
	}

	override onResize: TLOnResizeHandler<IDangerousHtmlShape> = (shape, info) => {
		return resizeBox(shape, info)
	}

	override onEditEnd = (shape: IDangerousHtmlShape)  => {
		// this.editor.setCursor({type: 'text', rotation: 0});
	}
	
}


// [3]
const customShape = [
    DangerousHtmlUtil
]

export default customShape;
