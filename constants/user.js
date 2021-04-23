//Liste des permission

const userMsg = {
	permission: {
		ADMIN: 'Administrateur',
		COLLABORATOR: 'Collaborateur',
		SELLER: 'Vendeur',
		DISPATCHER: 'Dispath',
		GUESS: 'Invité'
	},
	status: {
		ACTIVE: 'Actif',
		INACTIVE: 'Inactif'
	}
}
module.exports = {
	...userMsg
}
