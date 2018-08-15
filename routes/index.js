var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')
const {UserModel} = require('../db/models')
const filter = {password: 0, __v: 0} // 过滤掉查询时不需要的属性数据

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
/*router.post('/register', function (req, res) {
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
})*/


// 1. 注册的路由
router.post('/register', function (req, res) {
  // 1. 获取请求参数
  const {username, password, type} = req.body
  // 2. 处理: 根据username查询users集合, 如果有, 直接返回了一个失败的提示数据, 如果没有, 保存, 完成后返回一个成功的信息
  UserModel.findOne({username}, (error, userDoc) => {
    if(userDoc) {// 此用户已存在
      // 3. 返回响应(失败)
      res.send({code: 1, msg: '此用户已存在, 请重新注册'})
    } else {// 此用户不存在 , 可以注册
      new UserModel({username, password: md5(password), type}).save((error, userDoc) => {
        // 向浏览器返回一个cookie数据(实现注册成功后自动登陆了)
        res.cookie('userid', userDoc._id, {maxAge: 1000*60*60*24*7})
        // 3. 返回响应(成功)
        res.json({code: 0, data: {_id: userDoc._id, username, type}})
      })
    }
  })
})

// 2. 登陆的路由
router.post('/login', function (req, res) {
  const {username, password} = req.body
  // 根据username和password查询users集合, 如果有对应的user, 返回成功信息, 如果没有返回失败信息
  UserModel.findOne({username, password: md5(password)}, filter, (error, userDoc) => {
    if(userDoc) { // 成功
      // 向浏览器返回一个cookie数据(实现7天免登陆)
      res.cookie('userid', userDoc._id, {maxAge: 1000*60*60*24*7})

      res.send({code: 0, data: userDoc})
    } else { // 失败
      res.send({code: 1, msg: '用户名或密码错误!'})
    }
  })
})

// 3. 更新用户路由
router.post('/update', function (req, res) {
  // 得到请求cookie的userid
  const userid = req.cookies.userid
  if(!userid) {// 如果没有, 说明没有登陆, 直接返回提示
      return res.send({code: 1, msg: '请先登陆'});
  }

  //更新数据库中对应的数据
  UserModel.findByIdAndUpdate({_id: userid}, req.body, function (err, user) {// user是数据库中原来的数据
    const {_id, username, type} = user
    // node端 ...不可用
    // const data = {...req.body, _id, username, type}
    // 合并用户信息
    const data = Object.assign(req.body, {_id, username, type})
    // assign(obj1, obj2, obj3,...) // 将多个指定的对象进行合并, 返回一个合并后的对象
    res.send({code: 0, data})
  })
})


// 根据cookie获取对应的user
router.get('/user', function (req, res) {
  // 取出cookie中的userid
  const userid = req.cookies.userid
  if(!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }

  // 查询对应的user
  UserModel.findOne({_id: userid}, filter, function (err, user) {
    if(user) {
      return res.send({code: 0, data: user})
    } else {// cookie中的userid不正确
      res.clearCookie('userid')  // 删除不正确cookie数据
      return res.send({code: 1, msg: '请先登陆'})
    }
  })
})

/*
查看用户列表(指定类型的)
 */
router.get('/userlist',function(req, res){
  const { type } = req.query
  UserModel.find({type},filter, function(err,users){
    return res.json({code:0, data: users})
  })
})

module.exports = router;
