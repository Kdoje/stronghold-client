import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import cors from 'cors'
import { CONFIG } from '../config'
import startSocketIO from './sockets'
import fs from 'fs'
import Papa, { ParseResult } from "papaparse"
import { AnyCardT, StratagemCardT, UnitCardT } from 'common/types/game-data';


const port = process.env.PORT || CONFIG.port || 9000

const app = express()
app.use(cors({ origin: CONFIG.cors }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// this gets all the contents from the unit cards file
async function parseCards(fileNames: string[]): Promise<Map<string, AnyCardT>> {
	let parsedCount = 0;
	let p: Promise<Map<string, AnyCardT>> = new Promise((resolve, reject) => {
		let results = new Map<string, AnyCardT>();
		fileNames.forEach(fileName => {
			let fullPath = path.join(__dirname, fileName);
			const file = fs.createReadStream(fullPath);

			console.log("full path is " + fullPath);
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				complete: (rows: ParseResult<AnyCardT>) => {
					rows.data.forEach(row => {
						if (row.name.length === 0 && !(row.description.length === 0)) {
							reject(`CSV ${fileName} has invalid data. Check that file encoding is UTF-8 and rows for inconsistent missing fields`)
						}
						results.set(row.name, row);
					});
					parsedCount += 1;
					if (parsedCount == fileNames.length) {
						resolve(results);
					}
				}
			})
		})
	})
	return p;
}


let cards = await parseCards(CONFIG.fileNames)
console.log(cards.get('Bane of the Jungle'));
console.log("attack" in (cards.get('Starfall'))!); // check if card has a specific field
console.log((<UnitCardT>cards.get('Bane of the Jungle')).attack) // cast card to another type and access those fields

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

export { }