const { Parser } = require('json2csv')
/**
 * Sample Input
	let obj = {
		name: 'test',
		address: {
			personal: 'abc',
			office: {
				building: 'random',
				street: 'some street'
			}
		}
	}
 *
 *	expected Output : 
	{
		name : "test",
		address_personal: "abc"
		address_office_building: "random"
		address_office_street: "some street"
	}
 *
 * @param {*} obj
 * @param {*} parent
 * @param {*} res
 */

function flattenObj(obj, parent, res = {}) {
	for (let key in obj) {
		let propName = parent ? parent + '_' + key : key
		if (typeof obj[key] == 'object') {
			flattenObj(obj[key], propName, res)
		} else {
			res[propName] = obj[key]
		}
	}
	return res
}

/**
 * Ommet des key d'un object
 *
 * @param {*} keys
 * @param {*} obj
 */
const omit = (keys, obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)))

//génère le fichier csv avec les champs données
const downloadResource = (res, fileName, fields, data) => {
	const json2csv = new Parser({ fields })
	const csv = json2csv.parse(data)
	res.header('Content-Type', 'text/csv')
	res.attachment(fileName)
	return res.send(csv)
}

/** Génère une query */
function getQuery(req) {
	let sterm = req.query.sterm || ''
	let sfield = req.query.sfield || ''
	let order = req.query.order || 'asc'
	let orderby = parseInt(req.query.orderby) || 'name'
	let page = parseInt(req.query.page) || 1
	let limit = parseInt(req.query.limit) || 9999
	let offset = 0 + (page - 1) * limit
	let query = {}

	order = order.toLowerCase()

	//vérifie s'il y a des terms a rechercher
	if (sfield && sterm) {
		//vérifie s'il y a plus d'un terme à rechercher
		if (Array.isArray(sfield)) {
			sfield.forEach((field, index) => {
				if (Array.isArray(sterm)) {
					query[field] = { $regex: new RegExp(sterm[index], 'i') }
				} else {
					query[field] = { $regex: new RegExp(sterm, 'i') }
				}
			})
		} else {
			query = { [sfield]: { $regex: new RegExp(sterm, 'i') } }
		}
	}

	if (req.query.archive == 'true') {
		query.archive =
			req.query.archive === 'true' ? { $in: ['true', true] } : { $in: ['false', false, undefined, null] }
	}

	return [query, limit, order, orderby, offset]
}

module.exports = {
	downloadResource,
	getQuery,
	flattenObj,
	omit
}
