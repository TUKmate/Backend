const postModel = require('../models/postModel');
const likeModel = require('../models/likeModel');
const fileModel = require('../models/fileModel');

// 이미지 URL 생성 헬퍼
const getImageUrl = (fileId) => {
    return fileId ? `/api/files/${fileId}/view` : null;
};

// 전체 트윗 조회 (타임라인) - 페이징 지원
exports.getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const posts = await postModel.findAll(currentUserId, page, limit);
        const total = await postModel.countAll();
        const hasMore = page * limit < total;

        res.json({
            data: posts.map(t => ({
                ...t,
                is_liked: !!t.is_liked,
                profile_image: getImageUrl(t.profile_image_id),
                image: getImageUrl(t.image_id)
            })),
            page,
            limit,
            total,
            has_more: hasMore
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 게시글 작성
exports.createPost = async (req, res) => {
    try {
        const {
            dorm_type,
            title,
            content,
            imageId,

            mbti_ie,
            mbti_ns,
            mbti_ft,
            mbti_jp,
            birth_year,
            enrollment_year,
            sleep_start,
            sleep_end,
            smoking,
            bug,
            shower_style,
            shower_duration,
            sleep_sensitivity,
            home_visit_cycle,
            sleep_habits,
            game,
            cleanliness,
            discord,
            invite_friends
        } = req.body;
        const userId = req.user.id;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ message: '제목을 입력해주세요' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: '내용을 입력해주세요' });
        }

        if (content.length > 280) {
            return res.status(400).json({ message: '280자를 초과할 수 없습니다' });
        }

        // 이미지 ID 검증 (있으면)
        if (imageId) {
            const file = await fileModel.findById(imageId);
            if (!file) {
                return res.status(400).json({ message: '유효하지 않은 이미지입니다' });
            }
            if (file.user_id !== userId) {
                return res.status(403).json({ message: '본인이 업로드한 이미지만 사용할 수 있습니다' });
            }
        }

        const postId = await postModel.create({
            user_id: userId,
            dorm_type: dorm_type,
            title: title.trim(),
            content: content.trim(),
            image_id: imageId || null,

            mbti_ie: mbti_ie || null,
            mbti_ns: mbti_ns || null,
            mbti_ft: mbti_ft || null,
            mbti_jp: mbti_jp || null,
            birth_year: birth_year || null,
            enrollment_year: enrollment_year || null,
            sleep_start: sleep_start || null,
            sleep_end: sleep_end || null,
            smoking: smoking || null,
            bug: bug || null,
            shower_style: shower_style || null,
            shower_duration: shower_duration || null,
            sleep_sensitivity: sleep_sensitivity || null,
            home_visit_cycle: home_visit_cycle || null,
            sleep_habits: sleep_habits || null,
            game: game || null,
            cleanliness: cleanliness || null,
            discord: discord || null,
            invite_friends: invite_friends || null
        });

        const post = await postModel.findByIdWithUser(postId);

        res.status(201).json({
            ...post,
            profile_image: getImageUrl(post.profile_image_id),
            image: getImageUrl(post.image_id)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 트윗 삭제
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 트윗 존재 및 소유권 확인
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: '트윗을 찾을 수 없습니다' });
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: '삭제 권한이 없습니다' });
        }

        await postModel.delete(id);

        res.json({ message: '트윗이 삭제되었습니다' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 좋아요 토글
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 트윗 존재 확인
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: '트윗을 찾을 수 없습니다' });
        }

        // 좋아요 여부 확인
        const existingLike = await likeModel.findByUserAndPost(userId, id);

        if (existingLike) {
            await likeModel.delete(userId, id);
            res.json({ liked: false, message: '좋아요 취소' });
        } else {
            await likeModel.create(userId, id);
            res.json({ liked: true, message: '좋아요' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};