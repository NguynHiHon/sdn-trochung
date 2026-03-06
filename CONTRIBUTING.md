# Hướng dẫn đóng góp code (Contributing Guide)

Nhánh `main` được bảo vệ — **chỉ chủ sở hữu (@NguynHiHon) mới được push thẳng lên**.  
Các thành viên khác muốn đóng góp code phải thực hiện theo quy trình Pull Request bên dưới.

---

## Quy trình làm việc (Workflow)

### Bước 1 — Clone repository (chỉ làm một lần)

```bash
git clone https://github.com/NguynHiHon/sdn-trochung.git
cd sdn-trochung
```

### Bước 2 — Cập nhật nhánh main trước khi làm việc

Luôn đảm bảo bạn bắt đầu từ code mới nhất:

```bash
git checkout main
git pull origin main
```

### Bước 3 — Tạo nhánh mới cho tính năng / sửa lỗi của bạn

**Đặt tên nhánh theo quy tắc:**
- Tính năng mới: `feature/ten-tinh-nang`
- Sửa lỗi: `fix/mo-ta-loi`
- Cải thiện: `improve/mo-ta`

Ví dụ:
```bash
git checkout -b feature/them-chuc-nang-dang-nhap
```

### Bước 4 — Viết code và commit

```bash
# Thêm các file đã thay đổi
git add .

# Commit với mô tả rõ ràng
git commit -m "feat: thêm chức năng đăng nhập cho người dùng"
```

> **Quy tắc viết commit message:**
> - `feat:` — thêm tính năng mới
> - `fix:` — sửa lỗi
> - `refactor:` — cải thiện code không thêm tính năng
> - `docs:` — cập nhật tài liệu
> - `style:` — thay đổi giao diện / CSS

### Bước 5 — Push nhánh lên GitHub

```bash
git push origin feature/ten-nhanh-cua-ban
```

### Bước 6 — Tạo Pull Request trên GitHub

1. Vào trang repository: [https://github.com/NguynHiHon/sdn-trochung](https://github.com/NguynHiHon/sdn-trochung)
2. GitHub sẽ hiển thị thông báo **"Compare & pull request"** — nhấn vào đó
3. Điền thông tin Pull Request:
   - **Title**: Mô tả ngắn gọn bạn đã làm gì
   - **Description**: Giải thích chi tiết thay đổi (theo mẫu có sẵn)
4. Đảm bảo **base** là `main` và **compare** là nhánh của bạn
5. Nhấn **"Create pull request"**

### Bước 7 — Chờ review và phê duyệt

- **@NguynHiHon** sẽ nhận được thông báo và xem xét code của bạn
- Nếu cần chỉnh sửa, thực hiện thay đổi trên cùng nhánh đó và push lại — PR sẽ tự cập nhật
- Sau khi được phê duyệt ✅, **@NguynHiHon** sẽ merge PR vào `main`

---

## Lưu ý quan trọng

| ❌ Không được phép | ✅ Đúng quy trình |
|---|---|
| Push thẳng lên `main` | Tạo nhánh riêng rồi mở Pull Request |
| Merge PR của chính mình | Chờ @NguynHiHon phê duyệt và merge |
| Dùng tên nhánh chung chung (`test`, `fix`) | Dùng tên mô tả rõ ràng (`fix/loi-dang-nhap`) |

---

## Hỏi đáp

Nếu gặp vấn đề, hãy tạo một **Issue** trên GitHub để thảo luận trước khi bắt đầu code.
