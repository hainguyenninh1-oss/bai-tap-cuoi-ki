# StayFlow — Theo dõi SLA

StayFlow là giao diện web mô phỏng việc phối hợp các yêu cầu dịch vụ trong khách sạn. README này giới thiệu phần thực hiện cá nhân: **trang Theo dõi SLA**, dành cho quản lý khách sạn.

## Thông tin bài làm

- **Học phần:** Phát triển ứng dụng Web cơ bản — CSE122
- **Đề tài:** StayFlow — hệ thống phối hợp yêu cầu dịch vụ trong khách sạn
- **Trang thực hiện:** Theo dõi SLA
- **Sinh viên:** Nguyễn Ninh Hải
- **Mã sinh viên:** 2551060609
- **Mục đích:** Giúp quản lý theo dõi hạn xử lý dịch vụ, nhận biết yêu cầu sắp đến hạn hoặc quá hạn, lọc danh sách và phân công nhân viên.

## Liên kết

Điền các liên kết thật trước khi nộp:

- **Figma:** `[Dán link thiết kế Figma tại đây]`
- **Video trình bày:** `[Dán link video đã upload lên channel của học phần]`

Tên video theo định dạng yêu cầu: `CSE122-GK-SVxx-TenSinhVien-TheoDoiSLA`.

## Chức năng của trang

- Hiển thị các chỉ số tổng quan: tỷ lệ SLA, thời gian phản hồi trung bình, số yêu cầu sắp đến hạn và số yêu cầu quá hạn.
- Hiển thị biểu đồ xu hướng SLA theo giờ.
- Lọc yêu cầu theo loại dịch vụ và trạng thái.
- Tìm kiếm yêu cầu theo mã, phòng, dịch vụ hoặc nhân viên.
- Hiển thị thời gian còn lại và trạng thái xử lý.
- Phân công hoặc điều phối lại yêu cầu cho nhân viên đang trực.
- Mô phỏng thao tác nhắc nhân viên và ghi lại hoạt động.
- Xuất danh sách đang hiển thị thành tệp CSV.

## Công nghệ

- HTML5
- CSS3: Flexbox, CSS Grid, media query và responsive layout
- JavaScript thuần: DOM, event handling, lọc dữ liệu và render giao diện
- JSON làm dữ liệu mẫu
- `localStorage` lưu các thay đổi trong trình duyệt
- Google Fonts: Inter và Noto Serif

## Chạy trang

Ứng dụng tải dữ liệu JSON bằng `fetch()`, nên cần được mở qua máy chủ HTTP tĩnh:

1. Mở thư mục dự án trong Visual Studio Code.
2. Chạy tiện ích Live Server hoặc một máy chủ HTTP tĩnh khác.
3. Mở `pages/manager-sla-monitor.html`.

Không mở trực tiếp bằng `file://`, vì trình duyệt có thể chặn việc tải dữ liệu JSON.

## Cấu trúc thư mục

```text
hai-file/
├── css/
│   └── manager-admin.css
├── data/
│   └── stayflow.mock.json
├── js/
│   ├── admin-service-type-management.js
│   ├── admin-user-management.js
│   ├── manager-admin.js
│   ├── manager-dispatch-board.js
│   └── manager-sla-monitor.js
├── pages/
│   ├── admin-service-type-management.html
│   ├── admin-user-management.html
│   ├── manager-dispatch-board.html
│   └── manager-sla-monitor.html
└── README.md
```

## Mã nguồn chính

- [`pages/manager-sla-monitor.html`](pages/manager-sla-monitor.html) nạp stylesheet và các script cho trang.
- [`css/manager-admin.css`](css/manager-admin.css) định dạng khung trang, thẻ chỉ số, biểu đồ, bảng và bố cục responsive.
- [`js/manager-sla-monitor.js`](js/manager-sla-monitor.js) tính và hiển thị chỉ số, vẽ biểu đồ, lọc bảng, xử lý phân công, nhắc việc và xuất CSV.
- [`js/manager-admin.js`](js/manager-admin.js) cung cấp khung giao diện dùng chung, tải dữ liệu, lưu `localStorage`, tìm kiếm, hộp thoại và thông báo.
- [`data/stayflow.mock.json`](data/stayflow.mock.json) chứa dữ liệu mẫu của ứng dụng.

## Responsive

CSS dùng Grid để sắp xếp các thẻ chỉ số, Flexbox cho các nhóm công cụ và media query để điều chỉnh thanh điều hướng, khoảng đệm và bố cục trên màn hình nhỏ. Bảng được đặt trong vùng có thể cuộn ngang để giữ các cột dễ đọc trên thiết bị hẹp.

## Dữ liệu và giới hạn

- Dữ liệu ban đầu được đọc từ `data/stayflow.mock.json`.
- Các thay đổi được lưu trong `localStorage` của trình duyệt hiện tại; không đồng bộ giữa các thiết bị.
- Đây là sản phẩm frontend mô phỏng, chưa có backend hoặc cơ sở dữ liệu máy chủ.
- Biểu đồ theo giờ sử dụng dữ liệu minh họa; chỉ số SLA là phép tính đơn giản trên dữ liệu mẫu.
- Thao tác nhắc nhân viên chỉ hiển thị thông báo trong giao diện, không gửi tin nhắn thật.
- Gợi ý AI và các nội dung liên quan là dữ liệu mô phỏng, không gọi AI API.
