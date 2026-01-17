const pool = require('../config/db');

// 좋아요 여부 확인
exports.findByUserAndPost = async (userId, postId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
    );
    return rows[0];
};

// 좋아요 추가
exports.create = async (userId, postId) => {
    await pool.execute(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
    );
};

// 좋아요 삭제
exports.delete = async (userId, postId) => {
    await pool.execute(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
    );
};
