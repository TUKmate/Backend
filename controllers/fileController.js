const path = require('path');
const fs = require('fs');
const fileModel = require('../models/fileModel');

// 파일 업로드
exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '파일을 선택해주세요' });
        }

        const { originalname, filename, path: filePath, mimetype, size } = req.file;
        const userId = req.user.id;

        // DB에 파일 정보 저장
        const fileId = await fileModel.create(
            originalname,
            filename,
            filePath,
            mimetype,
            size,
            userId
        );

        res.status(201).json({
            message: '파일 업로드 성공',
            data: { id: fileId }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 파일 정보 조회
exports.getFileInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await fileModel.findById(id);
        if (!file) {
            return res.status(404).json({ message: '파일을 찾을 수 없습니다' });
        }

        res.json({
            id: file.id,
            originalName: file.original_name,
            mimeType: file.mime_type,
            size: file.size,
            createdAt: file.created_at
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 파일 다운로드 (원본 파일명으로)
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await fileModel.findById(id);
        if (!file) {
            return res.status(404).json({ message: '파일을 찾을 수 없습니다' });
        }

        // 파일 존재 확인
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ message: '파일이 존재하지 않습니다' });
        }

        // 원본 파일명으로 다운로드
        res.download(file.path, file.original_name);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 이미지 보기 (inline)
exports.viewFile = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await fileModel.findById(id);
        if (!file) {
            return res.status(404).json({ message: '파일을 찾을 수 없습니다' });
        }

        // 파일 존재 확인
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ message: '파일이 존재하지 않습니다' });
        }

        // Content-Type 설정하고 파일 전송
        res.set('Content-Type', file.mime_type);
        res.sendFile(path.resolve(file.path));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};

// 파일 삭제
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const file = await fileModel.findById(id);
        if (!file) {
            return res.status(404).json({ message: '파일을 찾을 수 없습니다' });
        }

        if (file.user_id !== userId) {
            return res.status(403).json({ message: '삭제 권한이 없습니다' });
        }

        // 실제 파일 삭제
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // DB에서 삭제
        await fileModel.delete(id);

        res.json({ message: '파일이 삭제되었습니다' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다' });
    }
};
