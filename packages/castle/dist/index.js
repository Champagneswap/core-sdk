
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./castle.cjs.production.min.js')
} else {
  module.exports = require('./castle.cjs.development.js')
}
