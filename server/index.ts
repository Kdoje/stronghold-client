import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'https'
import cors from 'cors'
import { CONFIG } from '../config'
import startSocketIO from './sockets'
import fs from 'fs'
import Papa, { ParseResult } from "papaparse"
import { AnyCardT, StratagemCardT, UnitCardT } from 'common/types/game-data';
import bodyParser from 'body-parser';


const port = process.env.PORT || CONFIG.port || 9000

const app = express()
app.use(cors({ origin: CONFIG.cors }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

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

app.use(
	express.static(path.join(__dirname, '..', CONFIG.clientPath), {
		maxAge: 1000 * 60 * 60,
	})
)

app.use('/', (req, res, next) => {
	if (req.accepts('text/html')) {
		res.sendFile(path.join(__dirname, '..', CONFIG.clientPath, 'index.html'))
	}
	else {
		next();
	}
})

app.post('/decklist', (req, res) => {
	let decklistReq = req.body.decklist.split(/[\r\n]+/);
	let decklistResp: AnyCardT[] = [];
	console.log(decklistReq)
	let wielder = cards.get("The Novice");
	decklistReq.forEach((cardDetails: string) => {
		let qtyIndex = cardDetails.indexOf(" ");
		let [quantity, cardName] = [cardDetails.slice(0, qtyIndex), cardDetails.slice(qtyIndex + 1)];
		let card = cards.get(cardName)
		if (card) {
			if (card.type.toLowerCase() === "wielder") {
				wielder = card;
			} else {
				for (let i = 0; i < parseInt(quantity); i++) {
					decklistResp.push(card!);
				}
			}
		}
	})
	res.setHeader('Content-Type', 'application/json');
	// TODO have this pull the wielder from the decklist
	res.end(JSON.stringify({ deck: decklistResp, wielder: wielder }));
})

app.get('/cardpool', (req, res) => {
	let cardNames = new Array(...cards.keys());
	let cardPoolResp = new Map<AnyCardT, number>();
	for (let i = 0; i < 90; i++) {
		const cardInd = Math.floor(Math.random() * cardNames.length);
		const card = cards.get(cardNames[cardInd])!
		cardPoolResp.set(card, (cardPoolResp.get(card) ?? 0) + 1);
	}
	res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({cardPool: JSON.stringify(Array.from(cardPoolResp.entries()))}))
})

const server = createServer(
	{
		key: fs.readFileSync(path.join(__dirname, "resources/key.pem")),
		cert: fs.readFileSync(path.join(__dirname, "resources/cert.pem"))
	}, app)


server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})


startSocketIO(server)

export { }