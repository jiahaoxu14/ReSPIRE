import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit'

const initialState = {
  reportOpen: false,
  highlightDoc: null,
  selectedId: "",
  selectedItems: [],
  selectedEntity: "",
  promptOpen: false,
  taskDescription: "Imagine you are an FBI agent analyzing the related events. The main task is to predict the nature of the terrorists' threat, including when and where this threat will be carried out, who is involved, and what will happen.",
  introduction: "Summarize your findings from those documents and clusters as the first paragraph of the Bottom Line Up Front manner. It should include the necessary information of Who, When, Where, and What.",
  clusterDescription: "[SUMMARIZATION of each cluster first in a sentence] [ANALYSIS CONTENT must include specific information of Who, When, Where and What. Be as detailed as you can, at least three sentences.]",
  conclusion: "Draw conclusions of how those clusters connect to each other, inferences, and speculate on causes and effects. Do not re-list the events mentioned here.",
}

const SpaceSlice = createSlice({
  name: 'space',
  initialState,
  reducers: {
    setReportOpen (state, action) {
      // console.log('set Modal Open is called');
      return {
        ...state,
        reportOpen: true
      }
    },
    setReportClose (state, action) {
    // console.log('set Modal Close is called');
        return {
            ...state,
            reportOpen: false
        }
    },
    setHighlightDoc (state, action) {
      return {
        ...state,
        highlightDoc: action.payload
      }
    },
    setSelectedId (state, action) {
      return {
        ...state,
        selectedId: action.payload
      }
    },
    setSelectedItems (state, action) {
      return {
        ...state,
        selectedItems: action.payload
      }
    },
    setSelectedEntity (state, action) {
      // console.log('[SpaceSlice] SelectedEntity', action.payload)
      return {
        ...state,
        selectedEntity: action.payload
      }
    },
    setPromptOpen (state, action) {
      return {
        ...state,
        promptOpen: action.payload
      }
    },
    setTaskDescription (state, action) {
      return {
        ...state,
        taskDescription: action.payload
      }
    },
    setIntroduction (state, action) {
      return {
        ...state,
        introduction: action.payload
      }
    },
    setClusterDescription (state, action) {
      return {
        ...state,
        clusterDescription: action.payload
      }
    },
    setConclusion (state, action) {
      return {
        ...state,
        conclusion: action.payload
      }
    }
    
  },
  extraReducers: builder => {
  }
})

export const {
  setReportOpen,
  setReportClose,
  setHighlightDoc,
  setSelectedId,
  setSelectedItems,
  setSelectedEntity,
  setPromptOpen,
  setClusterDescription,
  setConclusion,
  setIntroduction,
  setTaskDescription,
} = SpaceSlice.actions

export default SpaceSlice.reducer
