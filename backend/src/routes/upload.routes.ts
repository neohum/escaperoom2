import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.middleware';
import sharp from 'sharp';

const router = Router();

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다 (jpeg, jpg, png, gif, svg, webp)'));
    }
  }
});

// 이미지를 base64 인코딩된 SVG로 변환
const convertImageToSvgDataUrl = async (filePath: string): Promise<string> => {
  try {
    // 이미지를 버퍼로 읽기
    const imageBuffer = fs.readFileSync(filePath);
    
    // 이미지를 PNG로 변환하여 최적화
    const processedBuffer = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 80 })
      .toBuffer();
    
    // base64로 인코딩
    const base64Image = processedBuffer.toString('base64');
    
    // SVG 템플릿에 이미지 임베드
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 1200 1200" preserveAspectRatio="xMidYMid meet">
  <image width="100%" height="100%" xlink:href="data:image/png;base64,${base64Image}"/>
</svg>`;
    
    // SVG를 base64로 인코딩하여 data URL로 반환
    const svgBase64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${svgBase64}`;
  } catch (error) {
    console.error('Error converting image to SVG:', error);
    throw error;
  }
};

// 이미지 업로드
router.post('/image', verifyToken, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '파일이 업로드되지 않았습니다' });
      return;
    }

    const filePath = path.join(uploadDir, req.file.filename);
    
    // 이미지를 SVG data URL로 변환
    const svgDataUrl = await convertImageToSvgDataUrl(filePath);
    
    // 원본 파일 삭제 (SVG data URL을 사용하므로 더 이상 필요 없음)
    fs.unlinkSync(filePath);
    
    res.json({
      message: '이미지가 성공적으로 업로드되었습니다',
      url: svgDataUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: 'image/svg+xml'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다' });
  }
});

// 캐릭터 이미지 업로드 (별도 엔드포인트)
router.post('/character', verifyToken, upload.single('character'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '파일이 업로드되지 않았습니다' });
      return;
    }

    const filePath = path.join(uploadDir, req.file.filename);
    
    // 이미지를 SVG data URL로 변환
    const svgDataUrl = await convertImageToSvgDataUrl(filePath);
    
    // 원본 파일 삭제
    fs.unlinkSync(filePath);
    
    res.json({
      message: '캠릭터 이미지가 성공적으로 업로드되었습니다',
      url: svgDataUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: 'image/svg+xml'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다' });
  }
});

// 배경 이미지 업로드
router.post('/background', verifyToken, upload.single('background'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '파일이 업로드되지 않았습니다' });
      return;
    }

    const filePath = path.join(uploadDir, req.file.filename);
    
    // 이미지를 SVG data URL로 변환
    const svgDataUrl = await convertImageToSvgDataUrl(filePath);
    
    // 원본 파일 삭제
    fs.unlinkSync(filePath);
    
    res.json({
      message: '배경 이미지가 성공적으로 업로드되었습니다',
      url: svgDataUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: 'image/svg+xml'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다' });
  }
});

// 일반 파일 업로드
router.post('/file', verifyToken, upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '파일이 업로드되지 않았습니다' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: '파일이 성공적으로 업로드되었습니다',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다' });
  }
});

// 파일 삭제
router.delete('/:filename', verifyToken, (req: Request, res: Response): void => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: '파일을 찾을 수 없습니다' });
      return;
    }

    fs.unlinkSync(filePath);
    res.json({ message: '파일이 삭제되었습니다', filename });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다' });
  }
});

export default router;

