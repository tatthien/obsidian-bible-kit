const fs = require('fs')
const path = require('path')

module.exports = fs.readFileSync(
  path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
)
