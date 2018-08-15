const {ChatModel} = require('../db/models')

module.exports = function (server) {
// 得到IO对象(管理对象)
  const io = require('socket.io')(server)
  // 绑定连接的监听(当有一个新的客户端连接上时自动回调)
  io.on('connection', function (socket) {// socket代表服务器与某个浏览器的连接
    // 绑定sendMsg的监听(只针对当前新连接上的浏览器)
    socket.on('sendMsg', function ({content, from, to}) { // data为浏览器发送数据   {content, from, to}
      console.log('服务器接收到浏览器发送的消息', {content, from, to})
      const chat_id = [from, to].sort().join('_') // 标识一类聊天
      const create_time = Date.now() // 当前时间

      // 将消息保存到数据库集合chats
      new ChatModel({content, from, to, chat_id, create_time}).save(function (error, chatMsg) {
        // 将生成的chatMsg对象数据发送给浏览器
        io.emit('recieveMsg', chatMsg)
      })

    })
  })
}