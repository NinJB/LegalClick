const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "lupusjake0315",
    database: "legalclick"
})

module.exports = client
