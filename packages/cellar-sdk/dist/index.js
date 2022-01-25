
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cellar-sdk.cjs.production.min.js')
} else {
  module.exports = require('./cellar-sdk.cjs.development.js')
}
