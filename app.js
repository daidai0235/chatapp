let express = require('express');
let path = require('path');
let IO = require('socket.io');
let router = express.Router();
let mods = require('./public/js/fetch');
let red = require('./public/js/redqu');
let cookieParser = require('cookie-parser');
let apis = require('./public/js/api');

let app = express();
let server = require('http').Server(app);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// 创建socket服务
let socketIO = IO(server);
// 房间用户名单
let roomInfo = {};

let chatIO = socketIO.of('/chat');
let listIO = socketIO.of('/list');

listIO.on('connection', async (socket) => {
    // 获取连接用户身份
    let cookie = socket.request.headers.cookie;
    console.log(cookie);
    let uid = await mods.getCookie(cookie,'uid');
    if (!uid){
        socket.emit('notice','无法识别用户身份！');
        socket.emit('disconnect');
        return false;
    }
    // 设置用户与socketio关系
    let io = socket.id;
    await mods.saveSocketID(uid,io);

    socket.on('leave', function () {
        socket.emit('disconnect');
    });

    socket.on('disconnect', async () => {
        await mods.clearSocketID(uid);
        socket.emit('notice','连接断开！',0);
    });

    socket.on('like', async (toid,msg) => {
        let socketId = await mods.getSocketId(toid);
        console.log(socketId);
        if (socketId){
            let newlike = await red.redget("newlike"+toid);
            listIO.to(socketId).emit('newlike',newlike);
        }
    });

    socket.on('message', async (toid,msg) => {
        let socketId = await mods.getSocketId(toid);
        console.log(socketId);
        if (socketId){
            let unread = await red.redhgetall("unread_"+toid);
            listIO.to(socketId).emit('msg', unread);
        }
    });

});

chatIO.on('connection', async (socket) => {
  let cookie = socket.request.headers.cookie;
  console.log(cookie);
  let uid = await mods.getCookie(cookie,'uid');
  let toid = await mods.getCookie(cookie,'toid');
  console.log("ids:",uid,toid);
  if (!uid || !toid){
    socket.emit('notice','无法识别用户身份！',0);
    socket.emit('disconnect');
    return
  }
  let roomID = await mods.getroomID(uid,toid);
  socket.on('join', async () => {
    // 将用户昵称加入房间名单中
    if (!roomInfo[roomID]) {
      roomInfo[roomID] = [];
    }
    roomInfo[roomID].push(uid);
    // 是否互相喜欢
    let ifea = await mods.getIfeach(uid,toid);
    // 是否都是VIP用户
    let ifvip = await mods.getIfvip(uid,toid);
    console.log(ifea,ifvip);
    if(ifea && ifvip){
        socket.join(roomID);    // 加入房间
        socket.emit('notice','已连接！',1);
        let msglog = await mods.msglog(uid,toid,2);
        console.log(msglog);
        await red.redhdel("unread_"+uid,toid);
        socket.emit('msglog', msglog);
        // socketIO.to(roomID).emit('sys', uid + '加入了房间', roomInfo[roomID]);
        // console.log(uid + '加入了' + roomID);
        console.log(roomInfo);
    }else{
        // 发送消息通知，不符合聊天条件
        socket.emit('notice','未互相喜欢或非VIP，不能聊天哦',0);
        // 不符合条件，强制断开连接
        socket.emit('disconnect');
    }
  });

  socket.on('leave', function () {
    socket.emit('disconnect');
    console.log(roomInfo);
  });

  socket.on('disconnect', function () {
    // 判断当前房间是否在房间名单里面，若在则从房间名单中移除
    if(roomInfo.hasOwnProperty(roomID)){
        let index = roomInfo[roomID].indexOf(uid);
        if (index !== -1) {
            roomInfo[roomID].splice(index, 1);
        }
        if (roomInfo[roomID].length===0){
          delete roomInfo[roomID];
        }
        socket.leave(roomID);    // 退出房间
        socket.emit('notice','连接断开！',0);
        console.log(roomInfo);
    }
  });

  // 接收用户消息,发送相应的房间
  socket.on('message', async (msg,t) => {
      if(roomInfo.hasOwnProperty(roomID)){
          // 验证如果用户不在房间内则不给发送
          if (roomInfo[roomID].indexOf(uid) === -1) {
              return false;
          }
          await mods.insertMsg(uid,toid,msg,t);
          console.log(typeof roomID);
          chatIO.to(roomID).emit('msg', uid, msg);
          if(roomInfo[roomID].length===1){
              // 未读消息写入redis存储
              await red.redhincrby("unread_"+toid,uid,1);
              apis.send_msg(toid);
          }
      }
  });
});

// // room page
router.get('/', function (req, res) {
  window.location.href = "/index.html";
  // console.log(req.params);
  // let uid1 = req.params.uid1;
  // let uid2 = req.params.uid2;
  // 渲染页面数据(见views/room.hbs)
  // res.render('room', {
    // roomID: uid1+"/"+uid2,
    // users: roomInfo[uid1+"/"+uid2]
  // });
});

app.use('/', router);

server.listen(5000, function () {
  console.log('server listening on port 5000');
});
