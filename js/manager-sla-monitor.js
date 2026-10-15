(async () => {
  const main = SF.shell("manager", "sla", "Quản lý / Theo dõi SLA", "Theo dõi SLA");
  let db = await SF.load(), sv = "", st = "", cool = {};
  const HOURS = [91, 93, 90, 94, 95, 92, 95, 94, 96, 95], TARGET = 92, S = (r) => SF.state(r)[0];
  main.innerHTML = `<div class="head"><div><span class="gold">Cập nhật trực tiếp</span><h1>Sức khỏe SLA hôm nay</h1><p class="muted">Mục tiêu toàn khách sạn: ≥ ${TARGET}% yêu cầu trong SLA.</p></div><div class="tools"><button class="btn" id="xlsx">Xuất Excel (.xlsx)</button><a class="btn pri" href="manager-dispatch-board.html">Điều phối lại</a></div></div>
  <div id="k" class="kpis"></div><section class="card" id="c" aria-label="Xu hướng SLA theo giờ"></section>
  <div class="tools"><label>Dịch vụ <select id="fs"><option value="">Tất cả</option>${db.serviceTypes.map((s) => `<option value="${s.id}">${SF.esc(s.categoryName)}</option>`).join("")}</select></label><label>Trạng thái <select id="ft"><option value="">Tất cả</option><option>Quá hạn</option><option>Sắp hạn</option><option>Trong hạn</option><option>Đã đóng</option></select></label></div><div id="t" class="wrap"></div>`;
  const list = () => SF.rows(db).filter((r) => (!sv || r.serviceTypeId === sv) && (!st || S(r) === st) && SF.match(r.id + r.room + r.svc + (r.staff?.name || ""), SF.q))
    .sort((a, b) => (S(a) === "Đã đóng") - (S(b) === "Đã đóng") || a.due - b.due);

  function draw() {
    const all = SF.rows(db).filter((r) => r.status !== "Đã hủy"), over = all.filter((r) => S(r) === "Quá hạn").length, soon = all.filter((r) => S(r) === "Sắp hạn").length;
    const pct = all.length ? Math.round(((all.length - over) / all.length) * 1000) / 10 : 100;
    const rs = db.tasks.map((t) => { const r = db.requests.find((x) => x.id === t.requestId); return r && (new Date(t.assignedAt) - new Date(r.createdAt)) / 1000; }).filter((x) => x >= 0);
    const avg = rs.length ? Math.round(rs.reduce((a, b) => a + b) / rs.length) : 0;
    document.getElementById("k").innerHTML = [["SLA đạt", pct + "%", pct >= TARGET ? "ok" : "bad", pct >= TARGET ? "Đạt mục tiêu" : "Dưới mục tiêu " + TARGET + "%"], ["Phản hồi trung bình", `${Math.floor(avg / 60)}m ${String(avg % 60).padStart(2, "0")}s`, "info", "Mục tiêu dưới 5 phút"], ["Sắp hạn", String(soon).padStart(2, "0"), "warn", "Trong 20 phút tới"], ["Quá hạn", String(over).padStart(2, "0"), "bad", over ? "Cần xử lý ngay" : "Không có"]]
      .map(([n, v, c, h]) => `<div class="card kpi"><span>${n}</span><b>${v}</b><small><span class="chip ${c}">${h}</span></small></div>`).join("");
    document.getElementById("c").innerHTML = `<h3>Xu hướng SLA theo giờ</h3><p class="muted">Tỷ lệ hoàn thành trong SLA (dữ liệu minh họa). Thanh đỏ: dưới mục tiêu ${TARGET}%.</p><div class="chart" role="img" aria-label="Biểu đồ SLA theo giờ, từ 8:00 đến 17:00">${HOURS.map((v, i) => `<div><small>${v}%</small><i class="${v < TARGET ? "low" : ""}" style="height:${(v - 80) * 4}%"></i>${8 + i}:00</div>`).join("")}</div>`;
    const l = list();
    document.getElementById("t").innerHTML = `<table><thead><tr><th>Mã</th><th>Dịch vụ</th><th>Phòng</th><th>Nhân viên</th><th>Thời gian còn lại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${l.map((r) => { const [lb, c] = SF.state(r), closed = lb === "Đã đóng";
      return `<tr class="${lb === "Quá hạn" ? "bad-r" : lb === "Sắp hạn" ? "warn-r" : ""}"><td><strong>${r.id}</strong></td><td>${SF.esc(r.svc)}</td><td>${r.room}</td><td>${r.staff ? SF.esc(r.staff.name) : "Chưa phân công"}</td><td class="num"${closed ? "" : ` data-due="${r.due}"`}>${closed ? "—" : SF.fmt(SF.left(r))}</td><td><span class="chip ${c}">${lb}</span></td><td>${closed ? "" : `${r.staff ? `<button class="btn sm" data-n="${r.id}"${cool[r.id] ? " disabled" : ""}>${cool[r.id] ? "Đã nhắc" : "Nhắc nhân viên"}</button> ` : ""}<button class="btn sm" data-r="${r.id}">${r.staff ? "Điều phối lại" : "Phân công"}</button>`}</td></tr>`; }).join("")}</tbody></table>${l.length ? "" : SF.empty()}`;
  }
  async function exportExcel(button) {
    if (!window.ExcelJS) {
      const message = "Không tải được thư viện ExcelJS. Hãy kiểm tra kết nối Internet rồi tải lại trang.";
      console.error(message);
      SF.toast(message);
      return;
    }
    button.disabled = true;
    button.textContent = "Đang tạo Excel...";
    try {
      const rows = list();
      const all = SF.rows(db).filter((r) => r.status !== "Đã hủy");
      const over = all.filter((r) => S(r) === "Quá hạn").length;
      const soon = all.filter((r) => S(r) === "Sắp hạn").length;
      const pct = all.length ? Math.round(((all.length - over) / all.length) * 1000) / 10 : 100;
      const responseTimes = db.tasks.map((task) => {
        const request = db.requests.find((item) => item.id === task.requestId);
        return request && (new Date(task.assignedAt) - new Date(request.createdAt)) / 1000;
      }).filter((seconds) => seconds >= 0);
      const average = responseTimes.length ? Math.round(responseTimes.reduce((sum, seconds) => sum + seconds, 0) / responseTimes.length) : 0;
      const averageText = `${Math.floor(average / 60)}m ${String(average % 60).padStart(2, "0")}s`;
      const workbook = new window.ExcelJS.Workbook();
      workbook.creator = "StayFlow";
      workbook.created = new Date();
      workbook.modified = workbook.created;
      const summary = workbook.addWorksheet("Tổng quan", {
        views: [{ showGridLines: false }],
        pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });
      const navy = "101D33", gold = "B8914A", light = "F3F6FA", line = "D9E1EA";
      summary.columns = [
        { width: 20 }, { width: 28 }, { width: 14 },
        { width: 28 }, { width: 22 }, { width: 20 },
      ];
      summary.properties.defaultRowHeight = 22;
      summary.mergeCells("A1:F1");
      summary.getCell("A1").value = "STAYFLOW | BÁO CÁO THEO DÕI SLA";
      summary.getCell("A1").font = { name: "Aptos Display", size: 18, bold: true, color: { argb: "FFFFFFFF" } };
      summary.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${navy}` } };
      summary.getCell("A1").alignment = { vertical: "middle" };
      summary.getRow(1).height = 38;
      summary.mergeCells("A2:F2");
      summary.getCell("A2").value = "Tổng quan yêu cầu dịch vụ và thời hạn xử lý";
      summary.getCell("A2").font = { name: "Aptos", size: 11, color: { argb: "FF526174" }, italic: true };
      summary.mergeCells("A3:F3");
      summary.getCell("A3").value = `Ngày xuất: ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(new Date())}`;
      summary.getCell("A3").font = { name: "Aptos", size: 10, color: { argb: "FF526174" } };
      summary.mergeCells("A5:F5");
      summary.getCell("A5").value = "TỔNG QUAN";
      summary.getCell("A5").font = { bold: true, color: { argb: `FF${navy}` }, size: 11 };
      [["A6:B6", "Tổng yêu cầu"], ["C6:D6", "Sắp đến hạn"], ["E6:F6", "Quá hạn"]].forEach(([range, label]) => {
        summary.mergeCells(range);
        const cell = summary.getCell(range.split(":")[0]);
        cell.value = label;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${navy}` } };
        cell.alignment = { horizontal: "center" };
      });
      [["A7:B7", all.length], ["C7:D7", soon], ["E7:F7", over]].forEach(([range, value]) => {
        summary.mergeCells(range);
        const cell = summary.getCell(range.split(":")[0]);
        cell.value = value;
        cell.font = { bold: true, size: 16, color: { argb: `FF${navy}` } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${light}` } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      summary.getRow(7).height = 32;
      summary.mergeCells("A8:F8");
      summary.getCell("A8").value = `Tỷ lệ SLA đạt: ${pct}% (mục tiêu ${TARGET}%)  |  Phản hồi trung bình theo dữ liệu phân công: ${averageText}`;
      summary.getCell("A8").font = { size: 10, color: { argb: "FF526174" } };
      summary.mergeCells("A10:F10");
      summary.getCell("A10").value = "ĐIỀU KIỆN XUẤT";
      summary.getCell("A10").font = { bold: true, color: { argb: `FF${navy}` }, size: 11 };
      const serviceLabel = sv ? db.serviceTypes.find((service) => service.id === sv)?.categoryName || "Không xác định" : "Tất cả";
      summary.mergeCells("A11:F11");
      summary.getCell("A11").value = `Bộ lọc: Dịch vụ — ${serviceLabel}; Trạng thái — ${st || "Tất cả"}; Từ khóa — ${SF.q.trim() || "Không có"}`;
      summary.getCell("A11").font = { size: 10, color: { argb: "FF526174" } };
      summary.mergeCells("A12:F12");
      summary.getCell("A12").value = `Số yêu cầu khớp điều kiện lọc: ${rows.length}. Xem danh sách đầy đủ trong sheet "Chi tiết yêu cầu".`;
      summary.getCell("A12").font = { size: 10, color: { argb: "FF526174" } };
      const detail = workbook.addWorksheet("Chi tiết yêu cầu", {
        views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
        pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });
      detail.columns = [
        { width: 20 }, { width: 28 }, { width: 14 },
        { width: 28 }, { width: 22 }, { width: 20 },
      ];
      detail.properties.defaultRowHeight = 24;
      const header = detail.getRow(1);
      header.values = ["Mã yêu cầu", "Dịch vụ", "Phòng", "Nhân viên phụ trách", "Thời gian còn lại", "Trạng thái"];
      header.height = 28;
      header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${navy}` } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = { bottom: { style: "medium", color: { argb: `FF${gold}` } } };
      });
      rows.forEach((request, index) => {
        const status = S(request);
        const row = detail.addRow([
          request.id,
          request.svc || "Không xác định",
          request.room || "—",
          request.staff?.name || "Chưa phân công",
          status === "Đã đóng" ? "—" : SF.fmt(SF.left(request)),
          status,
        ]);
        row.height = 24;
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 ? "FFFFFFFF" : `FF${light}` } };
          cell.border = { bottom: { style: "hair", color: { argb: `FF${line}` } } };
          cell.alignment = { vertical: "middle", wrapText: true };
        });
        const statusCell = row.getCell(6);
        const statusColors = status === "Quá hạn" ? ["FFFCE8E6", "FFB3261E"]
          : status === "Sắp hạn" ? ["FFFFF4D6", "FF8A5A00"]
            : status === "Trong hạn" ? ["FFE5F3E9", "FF216E39"] : ["FFE8EEF7", "FF355070"];
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColors[0] } };
        statusCell.font = { bold: true, color: { argb: statusColors[1] } };
      });
      detail.autoFilter = { from: "A1", to: `F${Math.max(1, detail.rowCount)}` };
      const buffer = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      const now = new Date();
      const fileDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      anchor.download = `stayflow-bao-cao-sla-${fileDate}.xlsx`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      SF.toast(`Đã xuất báo cáo Excel gồm ${rows.length} yêu cầu`);
    } catch (error) {
      console.error("Không thể tạo báo cáo Excel SLA.", error);
      SF.toast("Xuất Excel thất bại. Hãy thử lại hoặc kiểm tra Console.");
    } finally {
      button.disabled = false;
      button.textContent = "Xuất Excel (.xlsx)";
    }
  }
  function pickStaff(r) {
    const p = SF.modal(`<h3>${r.staff ? "Điều phối lại" : "Phân công"} ${r.id}</h3><p class="muted">${SF.esc(r.svc)} · Phòng ${r.room}</p><div class="field"><label for="ns">Nhân viên đang trực</label><select id="ns">${db.staff.filter((s) => s.status === "Đang trực").map((s) => `<option value="${s.id}"${r.staff?.id === s.id ? " selected" : ""}>${SF.esc(s.name)} · ${s.role}</option>`).join("")}</select></div><div class="acts"><button class="btn" data-x>Hủy</button><button class="btn pri" id="ok">Xác nhận</button></div>`);
    p.querySelector("#ok").onclick = () => {
      const s = db.staff.find((x) => x.id === p.querySelector("#ns").value), snap = JSON.stringify(db);
      if (r.task) r.task.staffId = s.id; else db.tasks.push({ id: "TSK" + String(db.tasks.length + 1).padStart(3, "0"), requestId: r.id, staffId: s.id, status: "Chờ nhận", priority: r.priority, ai_priority_reason: r.ai_priority_reason, assignedAt: new Date(SF.now()).toISOString().slice(0, 19), completedAt: null });
      SF.log(db, `Điều phối ${r.id} cho ${s.name}`); SF.save(db); SF.close(); draw();
      SF.toast(`Đã giao ${r.id} cho ${s.name}`, () => { db = JSON.parse(snap); SF.save(db); draw(); });
    };
  }
  main.onclick = (e) => {
    const b = e.target.closest("[data-n],[data-r],#xlsx"); if (!b) return;
    if (b.id === "xlsx") {
      exportExcel(b);
    } else if (b.dataset.n) { const r = list().find((x) => x.id === b.dataset.n); cool[r.id] = 1; setTimeout(() => { delete cool[r.id]; draw(); }, 30000); SF.log(db, `Nhắc ${r.staff.name} xử lý ${r.id}`); SF.save(db); draw(); SF.toast(`Đã nhắc ${r.staff.name} xử lý ${r.id}`); }
    else pickStaff(list().find((x) => x.id === b.dataset.r));
  };
  document.getElementById("fs").onchange = (e) => { sv = e.target.value; draw(); };
  document.getElementById("ft").onchange = (e) => { st = e.target.value; draw(); };
  setInterval(() => document.querySelectorAll("[data-due]").forEach((c) => (c.textContent = SF.fmt(Math.round((+c.dataset.due - SF.now()) / 1000)))), 1000);
  SF.onq = draw; draw();
})();
