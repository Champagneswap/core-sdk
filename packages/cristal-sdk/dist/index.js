
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cristal-sdk.cjs.production.min.js')
} else {
  module.exports = require('./cristal-sdk.cjs.development.js')
}
