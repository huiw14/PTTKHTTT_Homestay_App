import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

dotenv.config();

const app = express();
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in server/.env');
}

const adapter = new PrismaMssql(databaseUrl);
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 5000;

// Cấu hình Middleware
// Cực kỳ quan trọng: Cho phép Frontend (chạy port 5173) gọi API mà không bị lỗi CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json()); // Cho phép backend đọc dữ liệu JSON từ Frontend gửi lên

// API Test Hệ thống
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'HomeStay Pro Backend đang hoạt động trơn tru!'
  });
});

// API Test Kết nối Database (Lấy danh sách phòng thử nghiệm)
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // Tự động gợi ý code vì Prisma đã quét DB của bạn
    const rooms = await prisma.pHONG.findMany(); 
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi kết nối Database' });
  }
});

app.listen(PORT, () => {
  console.log(`[Server]: Hệ thống Backend đang chạy tại http://localhost:${PORT}`);
});