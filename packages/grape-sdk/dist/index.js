
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./grape-sdk.cjs.production.min.js')
} else {
  module.exports = require('./grape-sdk.cjs.development.js')
}
