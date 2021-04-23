const express = require('express')
const fs = require('fs')
const mongoose = require('mongoose')
const Attachment = mongoose.model('Attachment')
const { forEach, keysIn } = require('lodash')
const { permission } = require('../constants/user')
const { ADMIN, COLLABORATOR, SELLER, DISPATCHER, GUESS } = permission
const attachmentController = {}

attachmentController.getAllAttachmentsFromCustomer = (req, res) => {
	const idCustomer = req.params.idCustomer

	//recherche la liste des contacts
	if (!idCustomer) {
		return res
			.status(422)
			.json({ success: false, message: "Vous n'avez pas fourni tous les informations nécessaire à la requête." })
	}

	Attachment.find({ customer: idCustomer })
		.populate({
			path: 'company'
		})
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v']) //champs à retirer

		.then(attachments => {
			res.json({ success: true, data: attachments })
		})
		.catch(err => res.status(500).json({ success: false, errors: err, message: "Une erreur s'est produite" }))
}

attachmentController.getAllAttachments = (req, res) => {
	Attachment.find({})
		.populate({
			path: 'company'
		})
		.populate({
			path: 'postedBy',
			select: ['name']
		})
		.select(['-__v'])
		.then(attachments => {
			res.json({ success: true, data: attachments })
		})
		.catch(err => res.status(500).json({ succes: false, errors: err, message: "Une erreur s'est produite" }))
}

attachmentController.uploadAttachment = async (req, res) => {
	const customer = req.params.idCustomer

	// try {
	if (!req.files) {
		res.send({
			success: false,
			message: "Aucun fichier n'a été uploadé"
		})
	} else {
		let title = req.body.title
		//Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
		let file = req.files.file

		let dirPath = getPath()
		let fileName = getFileName(file.name)

		//Use the mv() method to place the file in upload directory (i.e. "uploads")
		file.mv(`.${dirPath}${fileName}`)

		if (!title) {
			title = file.name.split('.')[0]
		}

		const data = {
			title: title,
			path: dirPath,
			original: file.name,
			name: fileName,
			mimetype: file.mimetype,
			size: file.size,
			postedBy: req.user._id,
			customer: customer
		}

		//enregistrement du fichier dans la base de données
		const createAttachment = new Attachment(data)
		try {
			createAttachment.save(function (err, savedData) {
				if (err) {
					return res.send({
						success: false,
						errors: err,
						message: "Un erreur s'est produite lors de l'enregistrement."
					})
				}
				//success
				return res.json({
					success: true,
					message: 'File is uploaded',
					data: {
						_id: savedData._id,
						createdAt: savedData.createdAt,
						title: title,
						path: dirPath,
						original: file.name,
						name: fileName,
						mimetype: file.mimetype,
						size: file.size,
						postedBy: {
							_id: savedData.postedBy._id
						}
					}
				})
			})
		} catch (err) {
			return res.json({
				success: false,
				errors: err,
				message: "Un problème est survenu lors de l'enregisrement du fichier"
			})
		}
	}
	// } catch (err) {
	// 	res.status(500).send(err)
	// }
}

attachmentController.uploadMultipleAttachments = async (req, res) => {
	const customer = req.params.idCustomer
	try {
		if (!req.files) {
			res.send({
				success: false,
				message: 'No file uploaded'
			})
		} else {
			let data = []

			//loop all files
			forEach(keysIn(req.files.files), key => {
				let file = req.files.files[key]
				let title = req.body.title || file.name.split('.')[0]

				let dirPath = getPath()
				let fileName = getFileName(file.name)

				//move photo to uploads directory
				file.mv(`.${dirPath}${fileName}`)

				//push file details
				data.push({
					title: title,
					path: dirPath,
					original: file.name,
					name: fileName,
					mimetype: file.mimetype,
					size: file.size,
					postedBy: req.user._id,
					customer: customer
				})
			})

			Attachment.insertMany(data)
				.then(function () {
					res.send({
						success: true,
						message: 'Files are uploaded',
						data: data
					})
				})
				.catch(function (err) {
					response.status(500).send(err)
				})
		}
	} catch (err) {
		res.status(500).send({ success: false, errors: err, message: 'Un problème est survenu' })
	}
}

attachmentController.downloadAttachment = (req, res) => {
	const idAttachment = req.params.idAttachment

	if (!mongoose.isValidObjectId(idAttachment)) {
		return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
	}
	Attachment.findOne({ _id: idAttachment })
		.select(['-__v'])
		.then(file => {
			if (!file) {
				return res.status(404).json({ success: false, message: "Cette page n'existe pas!" })
			}
			const { path, name } = file
			res.download(`${process.cwd()}${path}${name}`)
		})
		.catch(err => {
			console.log(process.cwd())
			return res.status(500).json({ success: false, erros: err, message: "Une erreur s'est produite" })
		})
}

//ne fonctionne pas encore.
attachmentController.deleteAttachment = (req, res) => {
	Attachment.findOneAndDelete({ _id: req.params.idAttachment }, function (err, file) {
		// console.log({ err }, { file })
		if (err) {
			return res.send({
				success: false,
				errors: err,
				status: '200',
				response: 'fail',
				message: "Un erreur s'est produite lors de la suppression"
			})
		}
		const { path, name } = file
		const pathFile = `${process.cwd()}${path}${name}`

		fs.unlink(pathFile, () => {
			res.send({
				success: true,
				status: '200',
				responseType: 'string',
				response: 'success',
				message: 'Le fichier a été correctement supprimé'
			})
		})
	})
}

function getPath(basePath = 'uploads') {
	let date = new Date()
	let month = ('0' + (date.getMonth() + 1)).slice(-2)
	let year = date.getFullYear()
	let dirPath = `/${basePath}/${year}/${month}/`

	return dirPath
}

//renomme le fichier afin d'éviter qu'un fichier soit écrasé
function getFileName(fileName) {
	let timestamp = new Date().getTime()
	let name = fileName.split('.')
	name[0] = `${name[0]}_${timestamp}`
	name = name.join('.')
	return name
}

module.exports = {
	attachmentController
}
