import {Server} from 'socket.io'
import {CONFIG} from '../config'
import http from 'http'


function startSocketIO(server: http.Server) {
	console.log("starting server");
	let curPlayer = 0;
	const io = new Server(server, {
		cors: {
			origin: CONFIG.cors,
			methods: ['GET', 'POST'],
		},
	})

	io.on('connection', (socket) => {
		console.log('client connected')
		socket.emit("playerId", curPlayer);
		curPlayer += 1;
		curPlayer %= 2;

        // TODO this should use a much simpler process of waiting for 2 players to connect, then starting
        // a session
	
		socket.onAny((event, message) => {
			console.log('[received] ', event, ': ', message)
			io.emit(event, message);
		
		})
		socket.on('disconnect', () => {
			
		})
	})
}

export default startSocketIO
