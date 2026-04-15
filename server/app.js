// 引入模块
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// 初始化Express
const app = express();
const port = 3000;

// 解决前端跨域问题 + 解析前端提交的JSON数据
app.use(cors());
app.use(express.json());

// ===================== 数据库连接配置（改成你自己的！） =====================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // 你的MySQL用户名
  password: '20061127qwer',  // 你的MySQL密码
  database: 'login_reg_db'   // 刚才创建的数据库名
});

// 测试数据库连接（增加错误详情打印）
db.connect((err) => {
  if (err) {
    console.log('❌ 数据库连接失败：', err.message); // 打印具体错误
    return;
  }
  console.log('✅ 数据库连接成功！');
});

// ===================== 注册接口 =====================
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  // 增加参数校验
  if (!username || !password) {
    return res.json({ code: 400, msg: '用户名和密码不能为空' });
  }

  // 先查询用户名是否已存在
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error('查询用户错误：', err);
      return res.json({ code: 500, msg: '服务器错误' });
    }
    if (result.length > 0) return res.json({ code: 400, msg: '用户名已存在' });

    // 密码加密
    const encryptPwd = bcrypt.hashSync(password, 10);
    // 插入用户数据到数据库
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, encryptPwd], (err) => {
      if (err) {
        console.error('插入用户错误：', err);
        return res.json({ code: 500, msg: '注册失败' });
      }
      res.json({ code: 200, msg: '注册成功！' });
    });
  });
});

// ===================== 登录接口 =====================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // 增加参数校验
  if (!username || !password) {
    return res.json({ code: 400, msg: '用户名和密码不能为空' });
  }

  // 查询用户
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error('查询用户错误：', err);
      return res.json({ code: 500, msg: '服务器错误' });
    }
    if (result.length === 0) return res.json({ code: 400, msg: '用户名不存在' });

    // 校验密码
    const isPwdOk = bcrypt.compareSync(password, result[0].password);
    if (!isPwdOk) return res.json({ code: 400, msg: '密码错误' });

    // 登录成功
    res.json({ code: 200, msg: '登录成功！', user: username });
  });
});

// 启动后端服务（增加错误捕获）
const server = app.listen(port, () => {
  console.log(`✅ 后端服务已启动：http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ 端口${port}被占用，请更换端口或关闭占用程序`);
  } else {
    console.log('❌ 服务启动失败：', err);
  }
});