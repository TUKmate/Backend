const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const { uploadImage } = require('../config/upload');

// 이미지 업로드 - 로그인 필수
router.post('/', authMiddleware, uploadImage.single('file'), fileController.upload);

// 파일 보기 (이미지 표시용) - /files/:id 로 바로 이미지 표시
router.get('/:id', fileController.viewFile);

// 파일 다운로드 (원본 파일명으로)
router.get('/:id/download', fileController.downloadFile);

// 파일 삭제 - 로그인 필수
router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;
