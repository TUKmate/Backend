const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const fileModel = require('../models/fileModel');

// 이미지 URL 생성 헬퍼
const getImageUrl = (fileId) => {
    return fileId ? `/api/files/${fileId}/view` : null;
};

// 내 프로필 조회
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }

        const postCount = await userModel.getPostCount(userId);

        res.json({
            data: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                major: user.major,
                year: user.year,
                dorm_type: user.dorm_type,
                sex: user.sex,
                age: user.age,
                profile_image_id: user.profile_image_id,
                profile_image: getImageUrl(user.profile_image_id),
                created_at: user.created_at,
                post_count: postCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 내 게시글 조회
exports.getMyPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await postModel.findByUserId(userId, userId);

        res.json({
            data: posts.map(t => ({
                ...t,
                is_liked: !!t.is_liked,
                profile_image: getImageUrl(t.profile_image_id),
                image: getImageUrl(t.image_id)
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 사용자 프로필 조회
exports.getUserProfile = async (req, res) => {
    try {
        const { nickname } = req.params;

        const user = await userModel.findByNickname(nickname);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }

        const postCount = await userModel.getPostCount(user.id);

        res.json({
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            major: user.major,
            year: user.year,
            dorm_type: user.dorm_type,
            sex: user.sex,
            age: user.age,
            profile_image: getImageUrl(user.profile_image_id),
            created_at: user.created_at,
            post_count: postCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 사용자 트윗 조회
exports.getUserPosts = async (req, res) => {
    try {
        const { nickname } = req.params;
        const currentUserId = req.user?.id;

        const user = await userModel.findByNickname(nickname);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }

        const posts = await postModel.findByUserId(user.id, currentUserId);

        res.json({
            data: posts.map(t => ({
                ...t,
                is_liked: !!t.is_liked,
                profile_image: getImageUrl(t.profile_image_id),
                image: getImageUrl(t.image_id)
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 프로필 수정
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nickname, major, year, dorm_type, sex, age, profileImageId } = req.body;


        // 프로필 이미지 ID 검증 (있으면)
        if (profileImageId !== undefined && profileImageId !== null) {
            const file = await fileModel.findById(profileImageId);
            if (!file) {
                return res.status(400).json({ message: '유효하지 않은 파일 ID입니다' });
            }
            if (file.user_id !== userId) {
                return res.status(403).json({ message: '본인이 업로드한 파일만 사용할 수 있습니다' });
            }
        }

        if (nickname === undefined && profileImageId === undefined) {
            return res.status(400).json({ message: '수정할 내용이 없습니다' });
        }

        await userModel.update(userId, { nickname, major, year, dorm_type, sex, age, profileImageId });
        const user = await userModel.findById(userId);

        res.json({
            data: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                major: user.major,
                year: user.year,
                dorm_type: user.dorm_type,
                sex: user.sex,
                age: user.age,
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