const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// 내 프로필 조회 - 로그인 필수
router.get('/me', authMiddleware, userController.getMyProfile);

// 내 트윗 조회 - 로그인 필수
router.get('/me/posts', authMiddleware, userController.getMyPosts);

// 프로필 수정 - 로그인 필수
router.put('/me', authMiddleware, userController.updateProfile);

// 특정 사용자 프로필 조회
router.get('/:nickname', userController.getUserProfile);

// 특정 사용자 트윗 조회
router.get('/:nickname/posts', (req, res, next) => {
    // 토큰이 있으면 파싱, 없어도 통과
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const jwt = require('jsonwebtoken');
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // 토큰 유효하지 않으면 무시
        }
    }
    next();
}, userController.getUserPosts);

module.exports = router;
