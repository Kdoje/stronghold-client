import {Server} from 'socket.io'
import {CONFIG} from '../config'
import { PLAYER_CONNECTED, PLAYER_ID } from '../common/MessageTypes';
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


		socket.onAny((event, message) => {
			if (event === PLAYER_CONNECTED) {
				socket.emit(PLAYER_ID, curPlayer);
				curPlayer += 1;
				curPlayer %= 2;
				console.log("curPlayer is ", curPlayer)
			} else {
				//console.log('[received] ', event, ': ', message)
				io.emit(event, message);
			}
		})
		socket.on('disconnect', () => {

		})
	})
}

export default startSocketIO
