const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname)));
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
  transports: ['websocket'], // Use only WebSocket transport
  secure: true, // Enable secure (HTTPS) connections
});


const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let generatedCode = null;

// Socket connection logic
function initiateSocketConnection(verificationCode) {
  const namespace = io.of(`/code/socket/${verificationCode}`);

  namespace.on('connection', (socket) => {
    console.log(`Socket connection started for verification code: ${verificationCode}`);

    socket.on('message', (message) => {
      namespace.emit('message', `${message}`);
    });
  });
}

app.get('/generate_code', (req, res) => {
  if (!generatedCode) {
    generatedCode = generateSixDigitCode();
    initiateSocketConnection(generatedCode);
    res.json({ code: generatedCode });
  } else {
    res.status(400).json({ error: 'Code has already been generated. Use /verify endpoint to check the code.' });
  }
});

app.post('/verify', (req, res) => {
  const userProvidedCode = req.body.code;

  if (generatedCode && userProvidedCode === generatedCode) {
    res.json({ message: 'Code is valid!' });
    generatedCode = null; // Reset generated code after verification
  } else {
    res.status(400).json({ error: 'Invalid code. Please provide the correct code from /generate_code.' });
  }
});

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'controller.html'));
});