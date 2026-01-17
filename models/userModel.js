const pool = require('../config/db');

// 이메일 또는 사용자명으로 사용자 조회
exports.findByUsernameOrNickname = async (username, nickname) => {
    const [rows] = await pool.execute(
        'SELECT id FROM users WHERE username = ? OR nickname = ?',
        [username, nickname]
    );
    return rows;
};

// 이메일로 사용자 조회
exports.findByUsername = async (username) => {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    return rows[0];
};

// ID로 사용자 조회 (프로필 이미지 조인)
exports.findById = async (id) => {
    const [rows] = await pool.execute(`
    SELECT
      u.id, u.username, u.nickname, u.profile_image_id, u.created_at,
      f.id as file_id
    FROM users u
    LEFT JOIN files f ON u.profile_image_id = f.id
    WHERE u.id = ?
  `, [id]);
    return rows[0];
};

// 사용자명으로 사용자 조회 (프로필 이미지 조인)
exports.findByNickname = async (nickname) => {
    const [rows] = await pool.execute(`
    SELECT
      u.id, u.username, u.nickname, u.profile_image_id, u.created_at,
      f.id as file_id
    FROM users u
    LEFT JOIN files f ON u.profile_image_id = f.id
    WHERE u.nickname = ?
  `, [nickname]);
    return rows[0];
};

// 사용자 생성
exports.create = async (username, hashedPassword, nickname) => {
    const [result] = await pool.execute(
        'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
        [username, hashedPassword, nickname]
    );
    return result.insertId;
};

// 프로필 수정
exports.update = async (id, data) => {
    const updates = [];
    const values = [];

    if (data.nickname !== undefined) {
        updates.push('nickname = ?');
        values.push(data.nickname);
    }

    if (data.profileImageId !== undefined) {
        updates.push('profile_image_id = ?');
        values.push(data.profileImageId);
    }

    if (updates.length === 0) return;

    values.push(id);
    await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
    );
};

// 사용자의 게시글 수 조회
exports.getPostCount = async (userId) => {
    const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
        [userId]
    );
    return rows[0].count;
};
