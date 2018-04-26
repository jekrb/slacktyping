require('env2')('.env')
var pump = require('pump')
var slack = require('slack')
var through = require('through2')
var websocket = require('websocket-stream')

var token = process.env.token
var delay = process.env.delay || 0

var opts = {
  token: token
}

var num = 1

slack.rtm.connect(opts, function (err, rtm) {
  if (err) return console.error(err)
  var stream = websocket(rtm.url)
  pump(stream, through(write), stream, function (err) {
    if (err) console.error(err)
  })
})

function write (buf, enc, next) {
  var row = JSON.parse(buf.toString())
  if (row.type !== 'user_typing') return next()
  var msg = {
    id: num++,
    type: 'typing',
    channel: row.channel
  }
  var payload = JSON.stringify(msg)
  setTimeout(function () {
    next(null, payload)
  }, delay)
}
