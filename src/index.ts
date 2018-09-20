import CQWebSocket from 'cq-websocket'
import { WebsocketType } from 'cq-websocket'

let cqwebConfig = {
  access_token: "",
  host: "172.81.230.235",
  port: 6700
}

console.log(cqwebConfig)

let bot = new CQWebSocket(cqwebConfig)

bot.on('socket.connecting', function (wsType, attempts) {
  console.log(`attemp to connect ${wsType} No.${attempts} started`)
}).on('socket.connect', function (wsType, sock, attempts) {
  console.log(`attemp to connect ${wsType} No.${attempts} success`)
}).on('socket.failed', function (wsType, attempts) {
  console.log(`attemp to connect ${wsType} No.${attempts} failed`)
})

bot.on('message', (event, context) => {
  console.log(event);
  console.log(context)
})

bot.connect()