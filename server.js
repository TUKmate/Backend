const app = require('./app');

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 : http://localhost:${PORT}`);
});