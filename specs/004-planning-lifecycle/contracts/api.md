# API lifecycle (12/11)

Contract chính thức đầy đủ: [docs/API.md](../../../docs/API.md#bổ-sung-tương-thích-ngày-12112026).

| Route                           | Input                                           | Output / lỗi chính                                                                   |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| PATCH /api/goals/:id            | name?,target?,targetDate?,archived?             | Updated goal; 400 extra/saved/invalid, 404 foreign                                   |
| POST /api/recurring/:id/replace | RecurringDto + Idempotency-Key tùy chọn         | previous,replacement; 400 tháng/paused; 409 ended/replaced/key conflict; 404 foreign |
| PATCH /api/auth/profile         | name                                            | safeUser; 400 email/password/extra                                                   |
| GET /api/transactions và export | month,kind,search,page,walletId,categoryId,sort | JSON phân trang hoặc CSV; 400 invalid, 404 foreign reference                         |

Replacement khóa rule trong Idempotency transaction, start >= current+1, > old.start, <= old.end nếu có. Response replay không ghi thêm. Goal ADD archived 400; WITHDRAW vẫn kiểm tra số đã dành theo goal/ví. Sort asc/desc, mặc định desc; wallet OR source/destination kết hợp AND category/search.
