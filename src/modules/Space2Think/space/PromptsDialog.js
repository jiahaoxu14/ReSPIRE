import React, { useState } from 'react';

// import Button from '@mui/material/Button';
import {Box, Button, TextField, Typography, Paper} from '@mui/material';

import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';
// import Typography from '@mui/material/Typography';
import {
    setPromptOpen,
    setClusterDescription,
    setConclusion,
    setIntroduction,
    setTaskDescription,
} from '../../LexicalEditor/slices/SpaceSlice.js'
import {
    useDispatch,
    useSelector
} from 'react-redux';



// const BootstrapDialog = styled(Dialog)(({ theme }) => ({
//   '& .MuiDialogContent-root': {
//     padding: theme.spacing(2),
//   },
//   '& .MuiDialogActions-root': {
//     padding: theme.spacing(1),
//   },
// }));

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export function PromptsDialog() {
  const dispatch = useDispatch();
  const promptOpen = useSelector(state => state.space.promptOpen);
  const taskDescription = useSelector(state => state.space.taskDescription);
  const introduction = useSelector(state => state.space.introduction);
  const clusterDescription = useSelector(state => state.space.clusterDescription);
  const conclusion = useSelector(state => state.space.conclusion);

  const [taskD, setTaskD] = useState(taskDescription);
  const [intro, setIntro] = useState(introduction);
  const [clusterD, setClusterD] = useState(clusterDescription);
  const [conclu, setConclu] = useState(conclusion);

  return (
      <Box 
      sx={{ width: 1500, maxWidth: '100%', margin: 'auto'}}
      >
      <Dialog
        aria-labelledby="customized-dialog-title"
        open={promptOpen}
        PaperComponent = {PaperComponent}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ m: 0, p: 2}} id="customized-dialog-title">
          Prompt
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            dispatch(setPromptOpen(false));
            console.log('Prompt Open', promptOpen)
            }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
        <Typography fontWeight={700}>
          Task Description:                
        </Typography>
        <TextField 
        multiline
        // rows={2}
        maxRows={4}
        fullWidth
        value={taskD} onChange={e => setTaskD(e.target.value)}/>

        {/* divider */}
        <Typography fontWeight={700}>
        &nbsp; 
        </Typography> 

        <Typography fontWeight={700}>
          Introduction:                   
        </Typography>
        <TextField 
        multiline
        // rows={2}
        maxRows={4}
        fullWidth
        value={intro} onChange={e => setIntro(e.target.value)}
        />

        {/* divider */}
        <Typography fontWeight={700}>
        &nbsp; 
        </Typography>

        <Typography fontWeight={700}>
          Cluster Content:                     
        </Typography>
        <TextField 
        multiline
        // rows={2}
        maxRows={4}
        fullWidth
        value={clusterD} onChange={e => setClusterD(e.target.value)}/>

        {/* divider */}
        <Typography>
        &nbsp;  
        </Typography>

        <Typography fontWeight={700}>
          Conclusion:         
        </Typography>
        <TextField 
        multiline
        // rows={2}
        maxRows={4}
        fullWidth
        value={conclu} onChange={e => setConclu(e.target.value)}/>
        </DialogContent>
        <DialogActions>
        <Button  
            onClick={() => {
              dispatch(setPromptOpen(false));
              dispatch(setTaskDescription(taskD));
              dispatch(setIntroduction(intro));
              dispatch(setClusterDescription(clusterD));
              dispatch(setConclusion(conclu));
              // console.log('Prompt Open', promptOpen)
            }}>
            Save changes
          </Button>
        <Button autoFocus
            color="warning"
            onClick={() => {
              dispatch(setPromptOpen(false));
              setTaskD(taskDescription);
              setIntro(introduction);
              setClusterD(clusterDescription);
              setConclu(conclusion);
            }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    // </React.Fragment>
  );
}