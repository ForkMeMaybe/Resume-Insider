import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Chip } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';

// Pages
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    const success = await login(username, password);
    if (success) {
      navigate('/upload');
    } else {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
        <Button component={RouterLink} to="/register" variant="text" sx={{ mt: 2 }}>
          Don't have an account? Sign Up
        </Button>
      </Box>
    </Container>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/users/', {
        email,
        username,
        password,
      });
      setSuccessMessage('Registration successful! You can now log in.');
      // Optionally navigate to login page after a delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err);
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.email) setError(`Email: ${errorData.email.join(', ')}`);
        else if (errorData.username) setError(`Username: ${errorData.username.join(', ')}`);
        else if (errorData.password) setError(`Password: ${errorData.password.join(', ')}`);
        else setError('Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error && error.includes('Email')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error && error.includes('Username')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && error.includes('Password')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type="password"
            id="password2"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            error={!!error && error.includes('match')}
            helperText={error}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
        {successMessage && <Typography color="success" sx={{ mt: 2 }}>{successMessage}</Typography>}
      </Box>
    </Container>
  );
};

const UploadPage = () => {
  const { authToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file first.');
      return;
    }

    setUploadMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}api/upload-resume/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      setUploadMessage(`Upload successful! Document ID: ${response.data.id}`);
      setSelectedFile(null); // Clear selected file
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error);
      setUploadMessage(`Upload failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Upload Resume</Typography>
      {authToken ? (
        <Box sx={{ mt: 2 }}>
          <input
            accept=".pdf"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span">
              {selectedFile ? selectedFile.name : 'Select PDF File'}
            </Button>
          </label>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!selectedFile}
            sx={{ ml: 2 }}
          >
            Upload
          </Button>
          {uploadMessage && <Typography sx={{ mt: 2 }}>{uploadMessage}</Typography>}
        </Box>
      ) : (
        <Typography>Please log in to upload documents.</Typography>
      )}
    </Container>
  );
};

const HistoryPage = () => {
  const { authToken } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}api/history/`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err.response?.data || err);
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchDocuments();
    // Optional: Poll for updates on pending insights
    const interval = setInterval(() => {
      const hasPending = documents.some(doc => doc.insight && doc.insight.status === 'PENDING');
      if (hasPending) {
        fetchDocuments();
      }
    }, 5000); // Poll every 5 seconds if there are pending insights

    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!authToken) {
    return (
      <Container>
        <Typography>Please log in to view your upload history.</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Upload History</Typography>
        <Button variant="outlined" onClick={fetchDocuments}>Refresh</Button>
      </Box>
      {documents.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">No documents uploaded yet.</Typography>
          <Typography variant="body2" color="text.secondary">Upload a resume to see its insights here!</Typography>
          <Button component={RouterLink} to="/upload" variant="contained" sx={{ mt: 2 }}>Upload Now</Button>
        </Box>
      ) : (
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Summary / Top Words</TableCell>
                <TableCell>Uploaded At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell component="th" scope="row">
                    <a href={doc.file} target="_blank" rel="noopener noreferrer">
                      {doc.file.split('/').pop()}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Chip label={doc.insight?.status || 'N/A'} color={getStatusChipColor(doc.insight?.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {doc.insight?.status === 'SUCCESS' && doc.insight?.summary && (
                      <Box sx={{ fontSize: '0.875rem' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {doc.insight.summary}
                        </ReactMarkdown>
                      </Box>
                    )}
                    {doc.insight?.status === 'FAILED' && doc.insight?.top_words?.words?.join(', ')}
                    {doc.insight?.status === 'PENDING' && 'Processing...'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'normal' }}>{new Date(doc.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

const PrivateRoute = ({ children }) => {
  const { authToken, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !authToken) {
      navigate('/login');
    }
  }, [authToken, loading, navigate]);

  if (loading) {
    return <p>Loading...</p>; // Or a loading spinner
  }

  if (!authToken) {
    return null; // Navigate is handled by useEffect
  }

  return children;
};

function App() {
  const { authToken, logout } = useAuth();

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Resume Insider
          </Typography>
          <Button color="inherit" component={RouterLink} to="/upload">Upload</Button>
          <Button color="inherit" component={RouterLink} to="/history">History</Button>
          {authToken ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* New Register Route */}
          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="*" element={<PrivateRoute><UploadPage /></PrivateRoute>} /> {/* Default route */}
        </Routes>
      </Container>
    </Box>
    </>
  );
}

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);