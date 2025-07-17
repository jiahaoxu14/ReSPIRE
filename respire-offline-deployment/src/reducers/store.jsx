import { configureStore } from '@reduxjs/toolkit'
import EditorReducer from '../modules/LexicalEditor/slices/EditorSlice'
import SpaceReducer from '../modules/LexicalEditor/slices/SpaceSlice'

export default configureStore({
    reducer: {
        editor: EditorReducer,
        space: SpaceReducer, 
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
})
