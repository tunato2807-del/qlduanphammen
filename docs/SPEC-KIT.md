# GitHub Spec Kit trong Finora

Spec Kit **v1.3.0** đã được tích hợp cho **Codex**, với chín skill, template,
script Bash và constitution riêng của Finora. Đây là công cụ cho quá trình phát
triển, không phải tính năng hoặc dependency chạy web/API.

## Dùng ngay

Yêu cầu **uv**, **Python 3.11+** và Bash (Linux/macOS, hoặc WSL trên Windows).
Mở terminal ở thư mục repository:

```bash
npm run spec-kit -- version
npm run spec-kit -- artifact list --json
```

Lần đầu, uv tạo `tools/spec-kit/.venv` và cài đúng dependency trong `uv.lock`.
Các lần sau dùng lại môi trường này; không cài package vào Python toàn hệ thống.
Không cần chạy `specify init` lại sau khi clone, vì scaffold đã được commit.

Nếu thiếu uv, cài theo [hướng dẫn chính thức](https://docs.astral.sh/uv/getting-started/installation/).
Nếu chỉ phát triển/chạy Finora như trước, vẫn dùng README; không bắt buộc cài uv.

## Lệnh trong chat Codex

Mở Codex tại repository (hoặc mở phiên mới để nạp các skill vừa được thêm):

```text
$speckit-specify Mô tả một thay đổi cụ thể mà bạn muốn thực hiện trong Finora.
$speckit-clarify
$speckit-plan Dùng kiến trúc và các dependency hiện có của Finora.
$speckit-tasks
$speckit-analyze
$speckit-implement
$speckit-converge
```

Chạy lần lượt, xem kết quả từng bước. `clarify` dùng khi có điểm chưa rõ;
`checklist` là bước tùy chọn để rà yêu cầu. `converge` kiểm tra phần việc còn thiếu,
không tự đồng nghĩa mọi kiểm thử đã đạt. Skill `$speckit-constitution` dùng để sửa
nguyên tắc dự án khi có nhu cầu; constitution hiện đã điền, không cần tạo lại.

Các dòng bắt đầu bằng `$speckit-...` là yêu cầu trong **chat**, không phải lệnh
terminal. Trong terminal, dùng `npm run spec-kit -- <lệnh CLI>`.

## Tệp nào dùng cho việc gì

| Đường dẫn                                    | Vai trò                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `.agents/skills/speckit-*/SKILL.md`          | Chín skill Codex chính thức                                             |
| `.specify/memory/constitution.md`            | Quy tắc Finora: tiền, quyền sở hữu, dữ liệu, kiểm thử và UI             |
| `.specify/templates/`                        | Template gốc; giữ nguyên để nâng phiên bản có thể so sánh               |
| `.specify/scripts/bash/`                     | Tạo feature, resolve template, setup plan/tasks, kiểm tra prerequisites |
| `.specify/workflows/speckit/`                | Định nghĩa workflow có review gate; chỉ chạy khi có yêu cầu riêng       |
| `specs/<số>-<tên>/`                          | Spec, plan, tasks và bằng chứng của một thay đổi mới                    |
| `tools/spec-kit/pyproject.toml` và `uv.lock` | CLI và dependency được ghim riêng                                       |
| `scripts/spec-kit.sh`                        | Wrapper chạy CLI bằng môi trường uv của dự án                           |

Bốn phần chính không đổi: `apps/`, schema/migration, dữ liệu và dependency npm.
Các file `SPEC-*.md`, `CAPABILITY-MAP.md`, `tasks/` cũ là hồ sơ V2, được giữ để đọc
bối cảnh. Thay đổi mới dùng `specs/`; không duy trì hai checklist đang hoạt động
cho cùng một việc. Hồ sơ của thay đổi đã hoàn tất được giữ làm lịch sử.

## Feature tích hợp đầu tiên

[001-spec-kit-adoption](../specs/001-spec-kit-adoption/spec.md) ghi lại chính việc
thêm toolkit này; không mô tả lại toàn bộ hệ thống. Các bước tạo spec và plan đã
được chạy bằng script chính thức. Khi cần chọn feature này trên máy mới:

```bash
SPECIFY_FEATURE_DIRECTORY="$PWD/specs/001-spec-kit-adoption" \
  bash .specify/scripts/bash/check-prerequisites.sh \
  --json --require-spec --require-tasks --include-tasks
```

`.specify/feature.json` là con trỏ cục bộ tới feature đang làm, được CLI quản lý và
không commit. Khi bắt đầu feature mới, `$speckit-specify` sẽ tạo thư mục tiếp theo
và cập nhật con trỏ. Tích hợp này không cài extension `git`, nên không tự tạo nhánh
hoặc tự commit; làm Git như quy trình hiện có của dự án.

## Kiểm chứng và cập nhật

```bash
npm run spec-kit -- version
npm run spec-kit -- check
npm run spec-kit -- artifact list --json
npm run check:fast
bash -n scripts/spec-kit.sh
```

`check` liệt kê khả năng sẵn có của các coding agent/tool; không yêu cầu mọi agent
đều được cài và không kiểm tra quyền đăng nhập của chúng. Kiểm tra template dùng
`bash .specify/scripts/bash/resolve-template.sh spec-template --json`.

Scaffold và CLI cùng version 1.3.0. Muốn nâng: sửa pin trong
`tools/spec-kit/pyproject.toml`, chạy `uv lock --project tools/spec-kit`, đọc hướng
dẫn nâng của phiên bản đích, commit baseline và xem diff của các managed file.
Không chạy lại `init --here --force` lên constitution đã điền chỉ để cập nhật CLI.
Không sửa `uv.lock` hoặc file manifest bằng tay để che khác biệt.

Không tự cài extension bên ngoài hoặc chạy `workflow run`: các thao tác đó có thể
gọi coding agent/công cụ khác. Bản tích hợp hiện chỉ có core và Codex skills,
không thêm runtime event handler hay ghi đè cấu hình Codex toàn máy.

## Nguồn và giấy phép

- [GitHub Spec Kit v1.3.0](https://github.com/github/spec-kit/tree/v1.3.0), commit
  `34a0d388eac671d656eb05b125ad3ed6056168ed`.
- [Kênh PyPI chính thức](https://pypi.org/project/specify-cli/1.3.0/): distribution
  `specify-cli==1.3.0` được dùng để cài; hash wheel và dependency nằm trong `uv.lock`.
- [Hướng dẫn cho dự án hiện có](https://github.com/github/spec-kit/blob/v1.3.0/docs/how-to/existing-projects.md).
- [Tích hợp Codex](https://github.com/github/spec-kit/blob/v1.3.0/docs/integrations/codex.md).
- Bản sao giấy phép MIT của GitHub cho scaffold: [LICENSE](../tools/spec-kit/LICENSE).

Constitution **1.0.0** được áp dụng ngày **2026-11-04**, tổng hợp tiêu chuẩn hiện có;
không thêm quy tắc sản phẩm hoặc quyền triển khai mới. Các template/skill do CLI
sinh được giữ nguyên; các hướng dẫn riêng của dự án ở constitution và tài liệu này.
