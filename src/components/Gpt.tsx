import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ListItemIcon,
  InputAdornment,
} from '@mui/material';
import ModeCommentIcon from '@mui/icons-material/ModeComment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChoicesProps {
  message: {
    content: string;
    role: 'user' | 'assistant' | string
  }

}

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const GptComponent: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(true);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return
    setApiKey(event.target.value);
    localStorage.setItem('api_Key', event.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setConversation((prevConversation) => [...prevConversation, { role: 'user', content: input }]);

    try {
      const response = await axios.post<{ choices: ChoicesProps[] }>(
        API_URL,
        {
          "model": "mistralai/mistral-7b-instruct",
          messages: [...conversation, { role: 'user', content: input }],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
        }
      );
      console.log("🚀 ~ handleSendMessage ~ response:", response)
      if (response.data && response.data?.choices && response.data?.choices.length > 0) {
        const AiRes = response.data.choices[0]?.message?.content;
        setConversation((prevConversation) => [
          ...prevConversation,
          { role: 'assistant', content: AiRes },
        ]);
      } else {
        setConversation((prevConversation) => [
          ...prevConversation,
          { role: 'assistant', content: 'Something went wrong, please try again.' },
        ]);
      }
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong, please try again.';
      setConversation((prevConversation) => [
        ...prevConversation,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    if (apiKey === '') return
    setOpenDialog(false);
  };


  useEffect(() => {
    const storedApiKey = localStorage.getItem('api_Key');
    if (storedApiKey && storedApiKey !== '') {
      setApiKey(storedApiKey);
      setOpenDialog(false);
    }
  }, []);

  return (
    <div className='p-4'>
      <Container maxWidth="md">
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Enter API Key</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your OpenRouter API key to start the conversation.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="API Key"
              type="password"
              fullWidth
              value={apiKey}
              onChange={handleApiKeyChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary" disabled={!apiKey}>
              Start
            </Button>
          </DialogActions>
        </Dialog>

        {!openDialog && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Typography textAlign={'center'} variant="h4" margin={2} gutterBottom>
              ChatGpt
            </Typography>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
              <List>
                {conversation.map((message, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {message.role === 'user' ? (
                        <AccountCircleIcon />
                      ) : (
                        <ModeCommentIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={message.content}
                      secondary={message.role === 'user' ? 'You' : 'ChatGPT'}
                    />
                  </ListItem>
                ))}
                <div style={{ textAlign: 'center' }}> {loading && <CircularProgress />} </div>
              </List>
            </div>
            <div style={{ padding: '16px' }}>
              <TextField
                label="Message ChatGPT"
                variant="outlined"
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!input.trim() || loading}
                      >
                        <SendIcon />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>
        )
        }
      </Container >
    </div >
  );
};

export default GptComponent;
