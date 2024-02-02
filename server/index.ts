import express, { response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'https'
import axios from 'axios';
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


function generateCardImagePath(cardName: string) {
	return path.join(__dirname, `resources/CardImages/${cardName}.png`)
}

async function saveImage(cardName: string) {
	const response = await axios.get(
		`https://image.pollinations.ai/prompt/a painting of a battlefield featuring the ${cards.get(cardName)?.subtype} ${cardName} `,
		{ responseType: 'arraybuffer' });
	fs.writeFileSync(generateCardImagePath(cardName), Buffer.from(response.data, 'binary'));
}

app.use('/cardimage/:cardName', async (req, res) => {
	const imagePath = generateCardImagePath(req.params.cardName);
	try {
		fs.accessSync(imagePath, fs.constants.F_OK);
	} catch {
		await saveImage(req.params.cardName);
	}

	res.setHeader('Content-Type', 'image/jpeg');

	res.sendFile(imagePath, (err) => {
		if (err) {
			res.status(404).send('Image not found');
		}
	});
})

app.use('/', (req, res, next) => {
	if (req.accepts('text/html')) {
		res.sendFile(path.join(__dirname, '..', CONFIG.clientPath, 'index.html'))
	}
	else {
		next();
	}
})

app.post('/cardlist', (req, res) => {
	let decklistReq = req.body.cardlist.split(/[\r\n]+/);
	let listResp: AnyCardT[] = [];
	console.log(decklistReq)
	decklistReq.forEach(async (cardDetails: string) => {
		let qtyIndex = cardDetails.indexOf(" ");
		let [quantity, cardName] = [cardDetails.slice(0, qtyIndex), cardDetails.slice(qtyIndex + 1)];
		let card = cards.get(cardName)
		if (card) {
			for (let i = 0; i < parseInt(quantity); i++) {
				listResp.push(card!);
			}	
		}
	})
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ list: listResp }));
})

app.post('/decklist', (req, res) => {
	let decklistReq = req.body.decklist.split(/[\r\n]+/);
	let decklistResp: AnyCardT[] = [];
	console.log(decklistReq)
	let wielder = cards.get("The Novice");
	decklistReq.forEach(async (cardDetails: string) => {
		cardDetails = cardDetails.replace(/[ \t\r]+/g," ");
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
	res.end(JSON.stringify({ deck: decklistResp, wielder: wielder }));
})

function addCardsToPool(pool: Map<AnyCardT, number>, cardsAtRarity: AnyCardT[], count: number) {
	for (let i = 0; i < count; i++) {
		const cardInd = Math.floor(Math.random() * cardsAtRarity.length);
		const cardToAdd = cardsAtRarity[cardInd];
		if (cardToAdd) {
			pool.set(cardToAdd, (pool.get(cardToAdd) ?? 0) + 1);
		}
	}
}

function getCardList() {
	return new Array(...cards.values());
}

app.get('/cardpool', (req, res) => {
	const totalCardCount = 90;
	const legendCount = 0;
	const rareCount = Math.floor(4 + Math.random() * 2);
	const uncommonCount = 0; // Math.floor(7 + Math.random() * 5);
	const commonCount = totalCardCount - legendCount - rareCount - uncommonCount;

	let commons =  getCardList().filter((card) => !card.rarity || card.rarity === 'C')
	let uncommons =  getCardList().filter((card) => {card.rarity === 'U'})
	let rares =  getCardList().filter((card) => card.rarity === 'R')
	let legends =  getCardList().filter((card) => {card.rarity === 'L'})
	let cardPoolResp = new Map<AnyCardT, number>();

	console.log(rares);

	addCardsToPool(cardPoolResp, legends, legendCount);
	addCardsToPool(cardPoolResp, rares, rareCount);
	addCardsToPool(cardPoolResp, uncommons, uncommonCount);
	addCardsToPool(cardPoolResp, commons, commonCount);
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

