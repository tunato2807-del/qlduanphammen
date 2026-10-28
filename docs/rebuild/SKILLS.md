# 25 skill đã đọc và phạm vi áp dụng

Ngày: 28/10/2026. Nguồn: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), commit [`aeac41d`](https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d). Giấy phép: [MIT](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/LICENSE).

Đã đọc toàn bộ 25 `skills/*/SKILL.md`, không chỉ README. Đọc không đồng nghĩa thực thi mọi workflow: chọn theo trigger, bối cảnh và quyền đã có. Không sao chép AGENTS.md nguồn sang Finora vì tệp đó tự giới hạn phạm vi cho người làm trong repository agent-skills.

| Skill                                                                                                                                                                           | Trạng thái / cách áp dụng                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [api-and-interface-design](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/api-and-interface-design/SKILL.md)                   | Đã đọc; rà soát hợp đồng REST và lỗi; đề xuất bổ sung mã lỗi theo cách tương thích, chưa thay API.                                                |
| [browser-testing-with-devtools](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/browser-testing-with-devtools/SKILL.md)         | Không có Chrome DevTools MCP trong phiên; dùng Playwright + Chromium + axe-core cho phần kiểm chứng runtime khả dụng. Không tuyên bố đã dùng MCP. |
| [ci-cd-and-automation](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/ci-cd-and-automation/SKILL.md)                           | Đã đọc; đề xuất trong delivery, chưa thay workflow/branch protection.                                                                             |
| [code-review-and-quality](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/code-review-and-quality/SKILL.md)                     | Đã dùng để rà soát hiện trạng theo các trục chất lượng.                                                                                           |
| [code-simplification](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/code-simplification/SKILL.md)                             | Đã đọc; dành cho refactor giữ hành vi sau khi hiểu ranh giới. Chưa refactor ở bước này.                                                           |
| [constraint-driven-development](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/constraint-driven-development/SKILL.md)         | Đã đọc; tiêu chuẩn đang ở mức đề xuất, chưa khóa CONSTRAINTS.md.                                                                                  |
| [context-engineering](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/context-engineering/SKILL.md)                             | Đã dùng nguyên tắc lưu nguồn, hiện trạng, quyết định và bước tiếp theo; chưa cài plugin toàn bộ vào project.                                      |
| [debugging-and-error-recovery](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/debugging-and-error-recovery/SKILL.md)           | Đã dùng để phân biệt số đo ngay sau resize và sau khi layout ổn định.                                                                             |
| [deprecation-and-migration](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/deprecation-and-migration/SKILL.md)                 | Đã đọc; giữ dữ liệu/migration, thay từng phần sau kiểm chứng; chưa xóa code hay đổi schema.                                                       |
| [documentation-and-adrs](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/documentation-and-adrs/SKILL.md)                       | Đã dùng cho hồ sơ rà soát/đề xuất. ADR thực thi sẽ theo quyết định được duyệt.                                                                    |
| [doubt-driven-development](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/doubt-driven-development/SKILL.md)                   | Đã đọc; chưa kích hoạt reviewer độc lập/cross-model hoặc gọi CLI bên ngoài.                                                                       |
| [frontend-ui-engineering](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/frontend-ui-engineering/SKILL.md)                     | Đã dùng đánh giá UI và lập phương án; chưa triển khai UI mới.                                                                                     |
| [git-workflow-and-versioning](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/git-workflow-and-versioning/SKILL.md)             | Dùng cho hồ sơ chuẩn bị và bảo toàn mốc đối chứng.                                                                                                |
| [idea-refine](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/idea-refine/SKILL.md)                                             | Đã đọc; hướng sản phẩm đã chọn nên không chạy ideation nhiều phương án.                                                                           |
| [incremental-implementation](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/incremental-implementation/SKILL.md)               | Đã đọc; dùng ở giai đoạn triển khai, từng lát cắt có kiểm chứng/commit.                                                                           |
| [interview-me](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/interview-me/SKILL.md)                                           | Đã đọc; bối cảnh/người dùng đã rõ từ trao đổi trước. Đã hỏi một câu ưu tiên và nhận câu trả lời; không chạy toàn bộ chuỗi phỏng vấn.              |
| [observability-and-instrumentation](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/observability-and-instrumentation/SKILL.md) | Đã đọc; đề xuất request ID và log allowlist, chưa tích hợp dịch vụ ngoài.                                                                         |
| [performance-optimization](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/performance-optimization/SKILL.md)                   | Đã ghi baseline build; chỉ tối ưu khi có số đo và giữ đúng nghiệp vụ.                                                                             |
| [planning-and-task-breakdown](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/planning-and-task-breakdown/SKILL.md)             | Đã đọc; plan/task chi tiết sau capability map và đặc tả được duyệt.                                                                               |
| [security-and-hardening](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/security-and-hardening/SKILL.md)                       | Đã rà soát đầu vào, quyền sở hữu, phiên và chạy native audit; chưa thay auth.                                                                     |
| [shipping-and-launch](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/shipping-and-launch/SKILL.md)                             | Đã đọc; dùng khi chuẩn bị triển khai. Chưa deploy production hay cấu hình dịch vụ có phí.                                                         |
| [source-driven-development](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/source-driven-development/SKILL.md)                 | Đã đọc; đối chiếu tài liệu chính thức theo phiên bản lockfile khi triển khai pattern framework mới.                                               |
| [spec-driven-development](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/spec-driven-development/SKILL.md)                     | Đang áp dụng Phase 0: capability map chờ duyệt trước đặc tả module.                                                                               |
| [test-driven-development](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/test-driven-development/SKILL.md)                     | Đã đọc; test hiện tại được chạy làm baseline. Chưa có behavior mới nên chưa có vòng RED/GREEN mới.                                                |
| [using-agent-skills](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/using-agent-skills/SKILL.md)                               | Áp dụng: chọn workflow theo công việc.                                                                                                            |

## Cổng duyệt hiện tại

Nguồn: [spec-driven-development — Phase 0](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/spec-driven-development/SKILL.md#phase-0-scope-check).

> The human reviews module boundaries, dependency direction, and build order before any module spec is written.

Yêu cầu làm lại toàn bộ bao gồm nhiều khả năng độc lập, vì vậy Phase 0 áp dụng. `CAPABILITY-MAP.md` là đầu ra để duyệt trước đặc tả module và triển khai. Đây là yêu cầu rõ trong skill; không phải hạn chế kỹ thuật hay suy diễn về quyền GitHub.

## Dấu vết nguồn

SHA-256 các SKILL.md đã đọc tại commit nguồn:

```text
e83d34f52ff12dd8a7c5134cd7e8140ea4541ec65e204f8a1e4cd366e30c4192  skills/api-and-interface-design/SKILL.md
4e3aacd6a380cd25bc6c2d67fdd1c926a9b22535b8a62109ecd33cefd909e3d9  skills/browser-testing-with-devtools/SKILL.md
a6ed8ed56456b01ff8314c44eefc69897d9905ae4e06bb2b7036286efb79b5f0  skills/ci-cd-and-automation/SKILL.md
2db1e850379f255fd3091ef278cde24cd6c7d2ba23e360cc52ea522c40d4396e  skills/code-review-and-quality/SKILL.md
f0c5ed754057eb0c1e027e2587f59de816651feb5e837242296c43ea21cf621d  skills/code-simplification/SKILL.md
06479d4305f286d23cfb99f5dc85695896785269664e1f6a8d800e3b71e70c10  skills/constraint-driven-development/SKILL.md
8b736cb9e55b82b265ab6ff78349c0e826e8a6df550deddf665b7fb3ff858b63  skills/context-engineering/SKILL.md
21f3960f5d7ae2cc95c40896545004dbbcbbd752ea65fc2d53962554d4174220  skills/debugging-and-error-recovery/SKILL.md
6a624f942e09c69863a4219b9bd5d56975026b67b0c70bc83385ffd2120b6142  skills/deprecation-and-migration/SKILL.md
b60d503925bbaacee7fd63935db70b9ced5b2514ff5a56a672130e01b9690bc5  skills/documentation-and-adrs/SKILL.md
6fa1fcd8420c28daf7e53c5b08b0f20b907911efd2a6d9bce0b9740da20a4008  skills/doubt-driven-development/SKILL.md
29a3e53d57c0a128831a20730ae874a8c4fda40c001fcdc15f8e9ad4b5f72f1b  skills/frontend-ui-engineering/SKILL.md
b7465d187935c52546d39fdc7bd6ac36d94eda25a9500ef8c18b767d2eb116ea  skills/git-workflow-and-versioning/SKILL.md
21ef828e3a2144245b67f840cc3805f761e98c9acce9a96670b7cd7441353463  skills/idea-refine/SKILL.md
df66536610071727feae1ca95f3c391c248ad828041750ccd3699cce763aa00b  skills/incremental-implementation/SKILL.md
ace4b675999bb504593d572e0f73f3d7e803ad6fddf318445598c82c11939db2  skills/interview-me/SKILL.md
e7fcb0820306d46268de9594d676ad98e35040858926c412b7000faa52a61f87  skills/observability-and-instrumentation/SKILL.md
bd36a30e55a5f84329a6977eba5e1ab7654146e71eaba88e34337d4ee020460f  skills/performance-optimization/SKILL.md
ed0f90cc5951ddd4bcab7f871f64efec93a49af9279ef93bc470da77ad8da3f7  skills/planning-and-task-breakdown/SKILL.md
2e3fc60eed5aba97fe416f3f3c9317fdb014a682925ec70a733c3ff99e4b9858  skills/security-and-hardening/SKILL.md
726f3e546369db289160b8d42195590f00b6432887e17bf19070dcc9a347fe39  skills/shipping-and-launch/SKILL.md
c59faf851377f0eeda45306398d16eb96d77ab1c2fd3e1a7fb58e9a0af33c1e9  skills/source-driven-development/SKILL.md
c4b97ce3d7f24be0e67fd612c7595f65504872e3a9f8d338d098b2363fdb66ef  skills/spec-driven-development/SKILL.md
a3aa6ba95638497025577469eda10ed17918698209615aeafbc26f131bf2469d  skills/test-driven-development/SKILL.md
30787ef2c77bf1a4729fffed0f6523ba6fcbe81bdc436b36371b78c21394d3c3  skills/using-agent-skills/SKILL.md
```

## Tài liệu đọc thêm

- `references/definition-of-done.md`: tiêu chuẩn đầu ra.
- `references/accessibility-checklist.md`: bàn phím, focus, nhãn và tương phản.

Không chạy script/hook cài tự động từ repository nguồn. Không thêm telemetry, dịch vụ ngoài hoặc thay cơ chế tài khoản chỉ vì ví dụ trong skill có đề cập.
