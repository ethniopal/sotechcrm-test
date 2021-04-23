const fs = require('fs')
// const csv = require('csv-parser')
// const neatCsv = require('neat-csv')

async function readCSV(file) {
	fs.createReadStream(file)
		.pipe(csv())
		.on('data', row => {
			console.log(row)
		})
		.on('end', () => {
			console.log('CSV file successfully processed')
		})
}

// async function readCSVNeat(file) {
// 	fs.readFile(file, async (err, data) => {
// 		if (err) {
// 			console.error(err + 'un erreur a eu lieu')
// 			return
// 		}
// 		await neatCsv(data)
// 		console.log(data[1])
// 	})
// }

module.exports = {
	readCSV
}
