let http = require('http');
let qs = require('querystring');
let moment = require('moment');
let db = require('./db');
moment.locale('zh-cn');

const send_msg = async (uid) => {
    let res = await db.query("select created from template_log where uid="+uid+" order by created limit 1");
    let Ltime;
    if (res.length > 0){
        Ltime = res[0].created;
    }else{
        Ltime = 0;
    }
    if (Date.parse(new Date())/1000-Ltime <= 60*5){
        return
    }
    let data = {
        uid:uid,
        name:'state',
        addr:'#/Pages/Message',
        first:'您有一条新消息，请点击查看!',
        string1:'新消息提醒',
        string2:moment().format('YYYY/MM/DD HH:mm')
    };
    let options = {
        host: 'www.layx.com.cn',
        port: 80,
        path: '/apis/send_msg',
        method: 'POST',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        }
    };
    let content = qs.stringify(data);
    let req = http.request(options, function(res){
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        let _data='';
        res.on('data', function(chunk){
            _data += chunk;
        });
        res.on('end', function(){
            console.log("\n--->>\nresult:",_data)
        });
    });
    req.write(content);
    req.end();
    return
};

module.exports = {
    send_msg: send_msg
};