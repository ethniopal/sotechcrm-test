const express = require('express')
const mongoose = require('mongoose')
const cron = require('node-cron')

/*
* * * * * *
| | | | | |
| | | | | day of week (3 = mercredi)
| | | | month (1 a 12)
| | | day of month 1 à 31
| | hour (0 à 23)
| minute (0 à 59)
second ( optional : 0 à 59 )*/
cron.schedule('* * * * *', function () {
	console.log('running a task every minute')
})
