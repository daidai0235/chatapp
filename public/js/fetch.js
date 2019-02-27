let db = require('./db');
let util = require('util');
let red = require('./redqu');

function getCookie(cookie,Name) {
    let search = Name + "="; //查询检索的值
    let returnvalue = "";//返回值
    if (!cookie){return null;}
    if (cookie.length > 0) {
        sd = cookie.indexOf(search);
        if (sd!= -1) {
            sd += search.length;
            end = cookie.indexOf(";", sd);
            if (end == -1)
                end = cookie.length;
            //unescape() 函数可对通过 escape() 编码的字符串进行解码。
            returnvalue=unescape(cookie.substring(sd, end))
        }
    }
    return returnvalue;
}

const msg_list = function(uid) {
  const _sql = "select * from chat_msg where uid1="+uid+" and uid1Delete<updated UNION select * from chat_msg where uid2="
    +uid+" and uid2Delete<updated";
  return db.query(_sql);
};

const getroomID = async (fid,toid) => {
    const _sql = util.format("select roomID from chat_msg where (uid1=%s and uid2=%s) or (uid1=%s and uid2=%s)",fid,toid,toid,fid);
    let res = await db.query(_sql);
    if (res.length > 0){
        return res[0].roomID
    }else{
        return null
    }
};

const msglog = function (fid,toid,p) {
  const _sql = util.format("select * from (select * from msglog where (fid=%s and toid=%s) or (fid=%s and toid=%s) and " +
      "isDelete=0 order by created desc limit %s,20) c order by created",fid,toid,toid,fid,(p-1)*20);
  return db.query(_sql);
};

const insertMsg = function (fid,toid,msg,t) {
  let now = Date.parse(new Date())/1000;
  const _sql = util.format("insert into msglog(fid,toid,msg,t,created,isDelete) values(%s,%s,'%s',%s,%s,%s)",fid,toid,msg,t,now,0);
  return db.query(_sql);
};

const setIO = function (fid,io) {
  const _sql = util.format("insert into iolist(fid,io) values(%s,'%s') on duplicate key update io='%s'",fid,io,io);
  return db.query(_sql);
};

const clearIO = function (fid,io) {
  const _sql = util.format("delete from iolist where fid=%s",fid);
  return db.query(_sql);
};

const getIO = function (fid) {
  const _sql = util.format("select io from iolist where fid=%s",fid);
  return db.query(_sql);
};

const getIfeach = async (fid,toid) => {
    const _sql1 = util.format("select status from user_user where uid1=%s and uid2=%s",fid,toid);
    const _sql2 = util.format("select status from user_user where uid1=%s and uid2=%s",toid,fid);
    let res1 = await db.query(_sql1);
    let res2 = await db.query(_sql2);
    console.log(res1,res2);
    if (res1.length === 1 && res2.length === 1){
        return res1[0].status > 0 && res2[0].status > 0
    }else{
        return false
    }
};


const getIfvip = async (fid,toid) => {
    let now = Date.parse(new Date())/1000;
    const _sql1 = util.format("select vip from userprofile where uid=%s",toid);
    const _sql2 = util.format("select vip from userprofile where uid=%s",fid);
    let res1 = await db.query(_sql1);
    let res2 = await db.query(_sql2);
    let ifvip;
    if (res1.length>0 && res2.length>0){
        console.log(now,res1[0].vip,res2[0].vip);
        ifvip = res1[0].vip >= now && res2[0].vip >= now
    }else{
        ifvip = false
    }
    return ifvip
};

const saveSocketID = function (uid,io) {
    const _sql = util.format("insert into iolist(fid,io) values(%s,'%s') on duplicate key update io='%s'",uid,io,io);
    return db.query(_sql);
};

const clearSocketID = function (uid) {
    const _sql = util.format("delete from iolist where fid=%s",uid);
    return db.query(_sql);
};

const getSocketId = async (uid) => {
    const _sql = util.format("select io from iolist where fid=%s",uid);
    let res = await db.query(_sql);
    if (res.length > 0){
        return res[0].io;
    }else{
        return null;
    }
};

module.exports = {
  msg_list: msg_list,
  setIO: setIO,
  clearIO: clearIO,
  getIO: getIO,
  msglog: msglog,
  insertMsg: insertMsg,
  getIfeach: getIfeach,
  getIfvip: getIfvip,
  getroomID: getroomID,
  getCookie: getCookie,
  saveSocketID: saveSocketID,
  clearSocketID: clearSocketID,
  getSocketId: getSocketId
};
