const redis = require('redis');
const client = redis.createClient({host:'localhost',port:6379,db:0});

let redget = function (key) {
  return new Promise(function (resolve,reject) {
    client.get(key,function (err,result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    })
  })
};


let redhget = function (key,field) {
  return new Promise(function (resolve,reject) {
    client.hget(key,field,function (err,result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    })
  })
};

let redhgetall = function (key) {
    return new Promise(function (resolve,reject) {
        client.hgetall(key,function (err,result) {
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
};

let redhincrby = function (key,field,value) {
    console.log(key,field,value);
    return new Promise(function (resolve,reject) {
        client.hincrby(key,field,value,function (err,result) {
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
};

let redhdel = function (key,field) {
    return new Promise(function (resolve,reject) {
        client.hdel(key,field,function (err,result) {
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
};

let redhset = function (key,field,value) {
  return new Promise(function (resolve,reject) {
    client.hset(key,field,value,function (err,result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    })
  })
};


let redset = function (key,value) {
  return new Promise(function (resolve,reject) {
    client.set(key,value,function (err,result) {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    })
  })
};

module.exports = {
  redget: redget,
  redset: redset,
  redhget: redhget,
  redhset: redhset,
  redhincrby: redhincrby,
  redhdel: redhdel,
  redhgetall: redhgetall
};
