/**
 * API Documentation README
 *
 * Backend Deposits API
 */

# Deposits API Documentation

## Endpoints

### 1. List Deposits
- **Method**: `GET`
- **URL**: `/api/deposits`
- **Query Parameters**:
  - `status`: Filter by status (ChoThanhToan, DaThanhToan, TuDongHuy, HuyThuCong)
  - `maCN`: Filter by branch ID
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "maPC": "PC001",
      "maKH": "KH001",
      "maNV": "NV001",
      "maCN": "CN001",
      "tienCoc": 1000000,
      "trangThai": "DaThanhToan",
      "ngayCoc": "2024-01-15T10:30:00Z",
      "hanThanhToan": "2024-01-16T10:30:00Z",
      "khachHang": { ... },
      "nhanVien": { ... },
      "chiNhanh": { ... },
      "chiTietPhieuCoc": [
        {
          "maPC": "PC001",
          "maGiuong": "G101A",
          "giuong": { ... }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

### 2. Get Deposit Detail
- **Method**: `GET`
- **URL**: `/api/deposits/:id`
- **Parameters**: `id` = maPC (e.g., PC001)
- **Response**: Same as single deposit object above

### 3. Create Deposit
- **Method**: `POST`
- **URL**: `/api/deposits`
- **Body**:
```json
{
  "maKH": "KH001",
  "maNV": "NV001",
  "maCN": "CN001",
  "tienCoc": 1000000,
  "beds": ["G101A", "G101B"]
}
```
- **Response**: Created deposit object with full details

### 4. Update Deposit
- **Method**: `PUT`
- **URL**: `/api/deposits/:id`
- **Body**:
```json
{
  "trangThai": "DaThanhToan"
}
```
- **Valid Statuses**:
  - `ChoThanhToan`: Chờ thanh toán (24h)
  - `DaThanhToan`: Đã thanh toán
  - `TuDongHuy`: Tự động hủy (quá hạn)
  - `HuyThuCong`: Hủy thủ công
- **Response**: Updated deposit object

### 5. Delete Deposit
- **Method**: `DELETE`
- **URL**: `/api/deposits/:id`
- **Response**:
```json
{
  "success": true,
  "message": "Xóa phiếu cọc thành công"
}
```

## Status Transitions

```
ChoThanhToan ──> DaThanhToan (user confirms payment)
              ──> TuDongHuy (automatic after 24h - trigger)
              ──> HuyThuCong (user cancels manually)
```

## Error Responses

All errors return with `success: false`:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `404`: Not found
- `500`: Server error

## Testing with cURL

```bash
# List deposits
curl -X GET http://localhost:5000/api/deposits

# Get detail
curl -X GET http://localhost:5000/api/deposits/PC001

# Create deposit
curl -X POST http://localhost:5000/api/deposits \
  -H "Content-Type: application/json" \
  -d '{
    "maKH": "KH001",
    "maNV": "NV001",
    "maCN": "CN001",
    "tienCoc": 1000000,
    "beds": ["G101A"]
  }'

# Update status
curl -X PUT http://localhost:5000/api/deposits/PC001 \
  -H "Content-Type: application/json" \
  -d '{"trangThai": "DaThanhToan"}'

# Delete deposit
curl -X DELETE http://localhost:5000/api/deposits/PC001
```

## Notes

- Tiền cọc không thể âm
- Phải có ít nhất khách hàng, nhân viên, chi nhánh hợp lệ
- Hạn thanh toán tự động = 24 giờ từ lúc tạo
- Khi delete, tự động xóa chi tiết phiếu cọc
