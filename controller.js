const socketURL = sessionStorage.getItem('socketURL');
const socket = io(socketURL, {
    transports: ['websocket'],
});

// Function to send WebSocket signal
function sendWebSocketSignal(direction) {
    socket.emit('message', direction);
}

// Function to monitor button state
function monitorButtonState(element, direction) {
    let isPressed = false;

    // Function to send WebSocket signal while pressed
    function sendWebSocketSignalWhilePressed() {
        if (isPressed) {
            sendWebSocketSignal(direction);
            setTimeout(sendWebSocketSignalWhilePressed, 100); // Adjust the interval as needed
        }
    }

    element.addEventListener('mousedown', () => {
        isPressed = true;
        sendWebSocketSignalWhilePressed();
    });

    element.addEventListener('mouseup', () => {
        isPressed = false;
        socket.emit('message', 'stop');
    });

    // For touch devices
    element.addEventListener('touchstart', (event) => {
        event.preventDefault();
        isPressed = true;
        sendWebSocketSignalWhilePressed();
    });

    element.addEventListener('touchend', (event) => {
        event.preventDefault();
        isPressed = false;
        socket.emit('message', 'stop');
    });

    // Click event
    element.addEventListener('click', () => {
        sendWebSocketSignal(direction);
    });
}

// Monitor button state for each button
monitorButtonState(document.getElementById('upButton'), 'up');
monitorButtonState(document.getElementById('downButton'), 'down');
monitorButtonState(document.getElementById('leftButton'), 'left');
monitorButtonState(document.getElementById('rightButton'), 'right');
monitorButtonState(document.getElementById('forwardButton'), 'forward');
monitorButtonState(document.getElementById('backwardButton'), 'backward');