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
  }
});
app.use('/static', express.static(path.join(__dirname, 'assets')));
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let generatedCode = null;
let team = null;
let teamcode = null;

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

function initiateSocketConnectionTeam(team, verificationCode) {
  const namespace = io.of(`/code/socket/${team}/${verificationCode}`);

  namespace.on('connection', (socket) => {
    console.log(`Team socket connection started for verification code: ${verificationCode}`);

    socket.on('message', (message) => {
      namespace.emit('message', `${message}`);
    });
  });
}

function initiateSocketConnectionTeamPlayer(team, verificationCode, player) {
  const namespace = io.of(`/code/socket/${team}/${verificationCode}/${player}`);

  namespace.on('connection', (socket) => {
    console.log(`Player socket connection started for verification code: ${verificationCode} and ${player}`);

    socket.on('message', (message) => {
      namespace.emit('message', `${message}`);
    });
  });
}

app.get('/generate_code', (req, res) => {
    generatedCode = generateSixDigitCode();
    initiateSocketConnection(generatedCode);
    res.json({ code: generatedCode });
});

app.post('/verify', (req, res) => {
  const userProvidedCode = req.body.code;

  if (generatedCode && userProvidedCode === generatedCode) {
    res.json({ message: 'Code is valid!' });
    generatedCode = null; // Reset generated code after verification
  } else {
    res.status(400).json({ error: 'Invalid code. Please provide the correct code.' });
  }
});

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'controller.html'));
});

app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.html'));
});

app.get('/simulator', (req, res) => {
  res.sendFile(path.join(__dirname, 'simulator.html'));
});

app.get('/team', (req, res)=>{
  res.sendFile(path.join(__dirname, 'createteam.html'))
});

app.post('/team', (req, res)=>{
  team = req.body.team;
  teamcode = generateSixDigitCode();
  console.log(teamcode);
  initiateSocketConnectionTeam(team, teamcode)
  console.log(team)
  res.json({code : teamcode});
});

app.get('/team/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify_team.html'))
});

app.get('/team/verify/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify_team_controller.html'))
});

app.post('/team/verify/controller', (req, res)=> {
  let enteredTeam = req.body.team;
  let enteredCode = req.body.code;
  let player = req.body.name;
  if (enteredTeam === team && enteredCode === teamcode){
    console.log('Team and Name Verrifed');
    initiateSocketConnectionTeamPlayer(enteredTeam, enteredCode, player);
    console.log('Socket Connection Initiated');
    res.json({message : 'Team and Code Verified'});
  }
  else{
    res.json({message : 'Please Check Your Team and Verification Code'});
  }
});

app.post('/team/verify', (req, res)=> {
  let enteredTeam = req.body.team;
  let enteredCode = req.body.code;
  if (enteredTeam === team && enteredCode === teamcode){
    console.log('Team and Name Verrifed')
    res.json({message : 'Team and Code Verified'});
  }
  else{
    res.json({message : 'Please Check Your Team and Verification Code'});
  }
});


app.get('/team/simulator', (req, res) => {
  res.sendFile(path.join(__dirname, 'team_simulator.html'));
});

app.get('/team/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'team_controller.html'));
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



