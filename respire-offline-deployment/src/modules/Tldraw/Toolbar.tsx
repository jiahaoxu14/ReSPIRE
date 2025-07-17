import React from "react";
import { DefaultToolbar, TLComponents, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

function CustomToolbar() {
	return (
		<div style={{ transform: 'rotate(180deg)' }}>
			<DefaultToolbar />
		</div>
	)
}

const TLComponents: TLComponents = {
	Toolbar: CustomToolbar, // null will hide the panel instead
}

export default TLComponents;