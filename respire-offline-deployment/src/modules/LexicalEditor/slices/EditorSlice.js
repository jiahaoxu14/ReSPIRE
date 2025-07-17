import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit'
import { key } from 'localforage';

const initialState = {
  report: "",
  UserKeywords: {},
  keywords:{},
  modifiedJson: "",
  ModifiedState: false,
  nodeKeys: [],
  nodeContent: [],
  underLineNodeKeys: [],
  curClickedNodeKey: "",
  newHl: "",
  adoptHl: "",
  rmHl: "",
  preReport: "",
}
const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCurClickedNodeKey (state, action) {
      return {
        ...state,
        curClickedNodeKey: action.payload
      }
    },
    setCurClickedCiteKey (state, action) {
      return {
        ...state,
        curClickedCiteKey: action.payload
      }
    },
    setReport (state, action){
      const report = action.payload
      return {
        ...state,
        report: report
      }
    },
    setUserKeywords (state, action) {
      const keywords = action.payload
      return {
        ...state,
        UserKeywords: keywords
      }
    },
    setKeywords (state, action) {
      const keywords = action.payload
      return {
        ...state,
        keywords: keywords
      }
    },
    setModifiedJson (state, action) {
      const modifiedJson = action.payload
      return {
        ...state,
        modifiedJson: modifiedJson
      }
    },
    setModifiedState (state, action) {
      const ModifiedState = action.payload
      return {
        ...state,
        ModifiedState: ModifiedState
      }
    },
    setNodeKeys (state, action) {
      const nodeKeys = action.payload
      return {
        ...state,
        nodeKeys: nodeKeys
      }
    },
    setNodeContent (state, action) {
      const nodeContent = action.payload
      return {
        ...state,
        nodeContent: nodeContent
      }
    },
    setunderLineNodeKeys (state, action) {
      const underLineNodeKeys = action.payload
      // console.log('[EditorSlice] underLineNodeKeys', underLineNodeKeys)
      return {
        ...state,
        underLineNodeKeys: underLineNodeKeys
      }
    },
    setNewHl (state, action) {
      const newHl = action.payload
      return {
        ...state,
        newHl: newHl
      }
    },
    setAdoptHl (state, action) {
      const adoptHl = action.payload
      return {
        ...state,
        adoptHl: adoptHl
      }
    },
    setRmHl (state, action) {
      const rmHl = action.payload
      return {
        ...state,
        rmHl: rmHl
      }
    },
    setPreReport (state, action) {
      const preReport = action.payload
      return {
        ...state,
        preReport: preReport
      }
    }
  },
  extraReducers: builder => {

  }
})

export const {
  setCurClickedNodeKey,
  setCurClickedCiteKey,
  setReport,
  setUserKeywords,
  setKeywords,
  setModifiedJson,
  setModifiedState,
  setNodeKeys,
  setNodeContent,
  setunderLineNodeKeys,
  setNewHl,
  setAdoptHl,
  setRmHl,
  setPreReport,
} = editorSlice.actions

export default editorSlice.reducer
