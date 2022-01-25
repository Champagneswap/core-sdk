
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./limit-order-sdk.cjs.production.min.js')
} else {
  module.exports = require('./limit-order-sdk.cjs.development.js')
}
