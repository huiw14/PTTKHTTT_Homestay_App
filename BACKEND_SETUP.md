# Backend Deposits API - Setup & Testing Guide

## Quick Start

### 1. Setup Backend Environment

```bash
cd backend

# Copy environment template
cp .env_example .env

# Edit .env and set your Supabase password
# DATABASE_URL and DIRECT_URL must have password filled in
```

### 2. Initialize Database

```bash
# Run only ONCE (or when you want to reset)
npm run db:reset

# This will:
# - Generate Prisma Client
# - Create tables on Supabase
# - Seed mock data
# - Apply triggers
```

### 3. Start Backend Server

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## API Endpoints

All endpoints are prefixed with `/api/deposits`

### GET /api/deposits - List Deposits

```bash
curl http://localhost:5000/api/deposits

# With filters
curl "http://localhost:5000/api/deposits?status=DaThanhToan&page=1&limit=10"
```

**Query Parameters:**
- `status`: Filter by status (ChoThanhToan, DaThanhToan, TuDongHuy, HuyThuCong)
- `maCN`: Filter by branch 
- `page`: Page number (default 1)
- `limit`: Items per page (default 10)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

### GET /api/deposits/:id - Get Detail

```bash
curl http://localhost:5000/api/deposits/PC001
```

---

### POST /api/deposits - Create Deposit

```bash
curl -X POST http://localhost:5000/api/deposits \
  -H "Content-Type: application/json" \
  -d '{
    "maKH": "KH001",
    "maNV": "NV001",
    "maCN": "CN001",
    "tienCoc": 2000000,
    "beds": ["G101A", "G101B"]
  }'
```

**Request Body:**
- `maKH` (required): Customer ID
- `maNV` (required): Employee ID
- `maCN` (required): Branch ID
- `tienCoc` (required): Deposit amount
- `beds` (optional): Array of bed IDs (empty for room-type deposits)

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiếu cọc thành công",
  "data": { PhieuCoc object with relations }
}
```

---

### PUT /api/deposits/:id - Update Status

```bash
curl -X PUT http://localhost:5000/api/deposits/PC001 \
  -H "Content-Type: application/json" \
  -d '{"trangThai": "DaThanhToan"}'
```

**Valid Status Values:**
- `ChoThanhToan` = Waiting for payment (24h deadline)
- `DaThanhToan` = Payment approved
- `TuDongHuy` = Automatically canceled (overdue)
- `HuyThuCong` = Manually canceled

---

### DELETE /api/deposits/:id - Delete

```bash
curl -X DELETE http://localhost:5000/api/deposits/PC001
```

---

## Frontend Integration

### 1. Using depositService

```typescript
import { depositService } from "@/app/services/depositService";

// List deposits
const response = await depositService.getDeposits({ page: 1, limit: 10 });

// Create deposit
const result = await depositService.createDeposit({
  maKH: "KH001",
  maNV: "NV001",
  maCN: "CN001",
  tienCoc: 2000000,
  beds: ["G101A"],
});

// Update status
await depositService.updateDeposit("PC001", { trangThai: "DaThanhToan" });

// Delete
await depositService.deleteDeposit("PC001");
```

### 2. Using useDepositStore Hook

```typescript
import { useDepositStore } from "@/app/hooks/useDepositStore";

export function MyComponent() {
  const { deposits, loading, error, addDeposit, fetchDeposits, updateDeposit } = useDepositStore();

  useEffect(() => {
    fetchDeposits(); // Load from API
  }, [fetchDeposits]);

  const handleCreate = async () => {
    try {
      const result = await addDeposit({
        maKH: "KH001",
        // ... data
      });
      console.log("Created:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {deposits.map(d => <div key={d.maPC}>{d.maPC}</div>)}
    </div>
  );
}
```

### 3. Data Transformation

Backend format ↔ Frontend format

```typescript
import { transformBackendDeposit, mapStatusToBackend } from "@/app/utils/depositTransform";

// Backend → Frontend
const frontendDeposit = transformBackendDeposit(backendData);

// Frontend → Backend (status)
const backendStatus = mapStatusToBackend("Đã duyệt");
```

---

## Common Issues

### 1. "Failed to fetch deposits: Connection refused"
- ✓ Backend server not running
- ✓ Port 5000 is already in use
- Solution: Run `npm run dev` from backend folder

### 2. "Khách hàng không tồn tại"
- ✓ Customer ID (maKH) doesn't exist in database
- Solution: Use valid IDs from seed data (KH001-KH008)

### 3. "Một số giường không tồn tại"
- ✓ One or more bed IDs (maGiuong) are invalid
- Solution: Use correct bed IDs from MOCK_BEDS (G101A, G101B, etc.)

### 4. API returns empty list
- ✓ Database not seeded
- Solution: Run `npm run db:seed` from backend folder

### 5. CORS Error in frontend
- ✓ Backend CORS not configured properly
- Current setup: `origin: "http://localhost:5173"`
- If frontend port changed, update [src/app/app.js](src/app/app.js) CORS config

---

## Testing Checklist
  
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173  
- [ ] Database seeded with mock data
- [ ] Can create deposit from Module 3 form
- [ ] New deposit appears in DepositManage table
- [ ] Can update status (Duyệt button works)
- [ ] Can delete deposit
- [ ] Error messages display properly
- [ ] Loading states show during API calls
- [ ] Refresh page shows persisted data from API

---

## Database Schema

See [db.md](src/db/db.md) for full schema documentation.

Key tables for deposits:
- **PhieuCoc**: Main deposit records
- **ChiTietPhieuCoc**: Individual beds in each deposit  
- **KhachHang**: Customers
- **NhanVien**: Employees
- **ChiNhanh**: Branches
- **Giuong**: Beds

---

## Architecture

```
Frontend Module3.tsx
    ↓
depositService.ts (HTTP client)
    ↓
Backend /api/deposits Router
    ↓
depositController.js (Business logic)
    ↓
Prisma ORM
    ↓
PostgreSQL (Supabase)
```

---

## Next Steps

- [ ] Implement authentication/authorization middleware
- [ ] Add request validation schemas
- [ ] Create deposit history/audit trail
- [ ] Implement auto-expiry cron job for overdue deposits
- [ ] Add transaction deposits (HopDong integration)
- [ ] Create reporting endpoints
