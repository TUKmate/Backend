const pool = require('../config/db');

// 전체 포스트 조회 (타임라인) - 페이징 지원
exports.findAll = async (currentUserId = null, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;

    const query = `
    SELECT
      t.*,
      u.nickname,
      u.profile_image_id,
      (SELECT COUNT(*) FROM likes WHERE post_id = t.id) as like_count,
      ${currentUserId ? '(SELECT COUNT(*) FROM likes WHERE post_id = t.id AND user_id = ?) as is_liked' : '0 as is_liked'}
    FROM posts t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;

    const params = currentUserId ? [currentUserId, limit, offset] : [limit, offset];
    const [rows] = await pool.execute(query, params);
    return rows;
};

// 전체 포스트 수 조회
exports.countAll = async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM posts');
    return rows[0].total;
};

// ID로 포스트 조회
exports.findById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM posts WHERE id = ?',
        [id]
    );
    return rows[0];
};

// 포스트 상세 조회 (작성자 정보 포함)
exports.findByIdWithUser = async (id) => {
    const [rows] = await pool.execute(`
    SELECT
      t.*,
      u.nickname,
      u.profile_image_id,
      0 as like_count,
      0 as is_liked
    FROM posts t
    JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
  `, [id]);
    return rows[0];
};

// 사용자의 포글스트 조회
exports.findByUserId = async (userId, currentUserId = null) => {
    const query = `
    SELECT
      t.*,
      u.nickname,
      u.profile_image_id,
      (SELECT COUNT(*) FROM likes WHERE post_id = t.id) as like_count,
      ${currentUserId ? '(SELECT COUNT(*) FROM likes WHERE post_id = t.id AND user_id = ?) as is_liked' : '0 as is_liked'}
    FROM posts t
    JOIN users u ON t.user_id = u.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `;

    const [rows] = await pool.execute(
        query,
        currentUserId ? [currentUserId, userId] : [userId]
    );
    return rows;
};

// 게시글 생성
exports.create = async (data) => {
    const {
        user_id,
        title,
        content,
        image_id = null,

        dorm_type = null,
        mbti_ie = null,
        mbti_ns = null,
        mbti_ft = null,
        mbti_jp = null,
        birth_year = null,
        enrollment_year = null,
        sleep_start = null,
        sleep_end = null,
        smoking = null,
        bug = null,
        shower_style = null,
        shower_duration = null,
        sleep_sensitivity = null,
        home_visit_cycle = null,
        sleep_habits = null,
        game = null,
        cleanliness = null,
        discord = null,
        invite_friends = null
    } = data;

    const [result] = await pool.execute(
        `
        INSERT INTO posts (
            user_id,
            dorm_type,
            title,
            content,
            image_id,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            user_id,
            dorm_type,
            title,
            content,
            image_id,
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
        ]
    );

    return result.insertId;
};


// 게시글 삭제
exports.delete = async (id) => {
    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
};
