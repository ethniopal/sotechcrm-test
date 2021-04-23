const mongoose = require('mongoose')
const { ObjectID } = mongoose.Schema.Types

const submissionSchema = new mongoose.Schema(
	{
		typeTransport: {
			type: String
		},
		customer: {
			type: ObjectID,
			ref: 'Customer'
		},
		address: {
			source: {
				address: {
					type: String
				},
				city: {
					type: String
				},
				province: {
					type: String
				},
				country: {
					type: String
				},
				zip: {
					type: String
				},
				date: {
					type: Date
				}
			},
			destination: {
				address: {
					type: String
				},
				city: {
					type: String
				},
				province: {
					type: String
				},
				country: {
					type: String
				},
				zip: {
					type: String
				},
				date: {
					type: Date
				}
			},
			deadlinesState: {
				type: String
			}
		},
		requestedService: {
			requestedService: {
				type: String
			},
			typeService: {
				type: String
			},
			typeApplication: {
				type: String
			},
			incoterms: {
				type: String
			},
			typeShipment: {
				type: String
			},
			typeEquipment: {
				type: String
			}
		},
		goods: {
			transport: {
				type: String
			},
			commodity: {
				type: String
			},
			quantity: {
				type: Number
			},
			totalWeight: {
				weight: {
					type: Number
				},
				unit: {
					type: String
				}
			},
			dimention: {
				lenght: {
					type: Number
				},
				width: {
					type: Number
				},
				height: {
					type: Number
				},
				unit: {
					type: String
				}
			},
			oversized: {
				type: Boolean
			},
			hazmat: {
				isHasmat: {
					type: Boolean
				},
				category: {
					type: String
				},
				un: {
					type: String
				},
				quantity: {
					type: Number
				},
				weight: {
					weight: {
						type: Number
					},
					unit: {
						type: String
					}
				}
			},
			//------- START international
			international: {
				overlaid: {
					type: Boolean
				},
				tailgateTruck: {
					type: Boolean
				},
				loadingDock: {
					type: Boolean
				},
				natureGoods: {
					type: String
				},
				cargoInsurance: {
					type: Boolean
				},
				hazardousMaterial: {
					type: Boolean
				},
				category: {
					type: String
				},
				totalValue: {
					type: Number
				}
			},
			//------- END international
			details: {
				type: String
			}
		},
		equipment: {
			transport: {
				type: String
			},
			trailer: {
				type: String
			},
			toile: {
				type: Boolean
			},
			details: {
				type: String
			}
		},
		postedBy: {
			type: ObjectID,
			ref: 'User'
		},
		status: {
			type: String
		}
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
	}
)

mongoose.model('Submission', submissionSchema)
