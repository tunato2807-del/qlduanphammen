# Verification: Spec Kit adoption

Hoàn tất kiểm chứng: 2026-11-05. Baseline ứng dụng: `ecfdcd5`.

| Kiểm tra                                                                       | Kết quả                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `uv lock` / `uv sync --locked`                                                 | Cài CLI 1.3.0 từ PyPI chính thức, theo lockfile riêng                    |
| `npm run spec-kit -- version`                                                  | CLI 1.3.0, Python 3.12.14 trong môi trường hiện tại                      |
| `npm run spec-kit -- check`                                                    | CLI sẵn sàng; agent khác không được cài là thông tin, không phải yêu cầu |
| `npm run spec-kit -- artifact list --json`                                     | JSON inventory hợp lệ, 18 artifact                                       |
| Skills Codex                                                                   | 9 `SKILL.md` trong `.agents/skills/speckit-*`                            |
| Manifest checksum                                                              | Tất cả file core/Codex được CLI quản lý khớp SHA-256 trong manifest      |
| Constitution                                                                   | 1.0.0; không còn placeholder; template gốc không bị sửa                  |
| Create feature / setup plan / setup tasks                                      | Đã chạy script chính thức cho `001-spec-kit-adoption`                    |
| `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` | Thành công cho feature 001                                               |
| `create-new-feature.sh --dry-run --json`                                       | Resolve feature 002, không tạo thư mục/file mới                          |
| `bash -n scripts/spec-kit.sh .specify/scripts/bash/*.sh`                       | Thành công                                                               |
| `npm run check:fast`                                                           | TypeScript và kiểm tra định dạng đạt                                     |
| File/state cục bộ                                                              | `.venv` và `.specify/feature.json` được ignore                           |
| So sánh với baseline                                                           | `apps/`, Node lockfile, compose/schema/migration và hồ sơ V2 không đổi   |
| Liên kết tài liệu và `git diff --check`                                        | Đạt                                                                      |

Không chạy lại database/browser/build suite vì thay đổi này chỉ thêm công cụ và
tài liệu phát triển; không tuyên bố kiểm thử lại behavior ứng dụng. Không chạy
workflow gọi coding agent, extension ngoài, runtime event handler hoặc triển khai
production. Source CLI/asset được đối chiếu tag v1.3.0, commit
`34a0d388eac671d656eb05b125ad3ed6056168ed`; distribution cài đặt là
`specify-cli==1.3.0` từ kênh PyPI chính thức.
