import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import {createServer} from 'http'
import cors from 'cors'
import {CONFIG} from '../config'
import startSocketIO from './sockets'
import fs from 'fs'

const port = process.env.PORT || CONFIG.port || 9000

const app = express()
app.use(cors({origin: CONFIG.cors}))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// this gets all the contents from the unit cards file
const contents = fs.readFileSync(path.join(__dirname, CONFIG.fileNames.unitCards));
console.log(contents.toString());

app.use(
	express.static(path.join(__dirname, '..', CONFIG.clientPath), {
		maxAge: 1000 * 60 * 60,
	})
)

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', CONFIG.clientPath, 'index.html'))
})


const server = createServer(app)


server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})

startSocketIO(server)

export {}