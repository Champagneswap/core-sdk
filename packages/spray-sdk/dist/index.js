
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./spray-sdk.cjs.production.min.js')
} else {
  module.exports = require('./spray-sdk.cjs.development.js')
}
