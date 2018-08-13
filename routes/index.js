var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/*
提供一个用户注册的接口
  a)path为: /register
  b)请求方式为: POST
  c)接收username和password参数
  d)admin和xfzhang是已注册用户
  e)注册成功返回: {code: 0, data: {_id: 'abc', username: ‘xxx’, password:’123’}}
  f)注册失败返回: {code: 1, msg: '此用户已存在'}
 */
/*
后台路由回调的3步?
1. 获取请求参数数据
    GET:
      query参数: /register?username=xxx&password=yyy   req.query属性
      param参数: /register/:username  /register/xxx   req.params属性
    POST: req.body属性
2. 处理数据
    a. 会有一些逻辑计算
    b. 可能会操作数据库

3. 返回响应数据
 */
router.post('/register', function (req, res) {
  // 1. 获取请求参数数据
  const {username, password} = req.body

  // 2. 处理数据
  if (username==='admin' || username==='xfzhang') { // 注册不能成功
    // 3. 返回响应数据(失败)
    res.send({code: 1, msg: '此用户已存在'})
    // res.json({code: 1, msg: '此用户已存在'})
  } else { // 注册能成功
    // 将用户信息保存到数据库
    // 3. 返回响应数据 (成功)
    res.json({code: 0, data: {_id: 'abc', username, password}})
  }
})

module.exports = router;
