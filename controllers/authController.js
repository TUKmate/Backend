const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// 이미지 URL 생성 헬퍼
const getImageUrl = (fileId) => {
    return fileId ? `/api/files/${fileId}` : null;
};

// 회원가입
exports.register = async (req, res) => {
    try {
        const { username, password, passwordConfirm, nickname } = req.body;

        // 입력 검증
        if (!username || !password || !passwordConfirm || !nickname) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요' });
        }

        // 이메일/사용자명 중복 확인
        const existing = await userModel.findByUsernameOrNickname(username, nickname);
        if (existing.length > 0) {
            return res.status(400).json({ message: '이미 존재하는 이메일 또는 사용자명입니다' });
        }

        // 비밀번호 일치 확인
        if (password != passwordConfirm) {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const userId = await userModel.create(username, hashedPassword, nickname);

        res.status(201).json({
            message: '회원가입 성공',
            userId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 로그인
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요' });
        }

        // 사용자 조회
        const user = await userModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다' });
        }

        // 비밀번호 검증
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다' });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { id: user.id, username: user.username, nickname: user.nickname },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: '로그인 성공',
            token,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                profile_image_id: user.profile_image_id,
                profile_image: getImageUrl(user.profile_image_id),
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};
