# 🎓 博士后申请追踪 · Postdoc Application Tracker

> 一个专为博士生设计的博士后申请全流程管理工具，支持导师信息自动补全、学校排名与国旗展示、多平台岗位广告聚合。

**在线访问 →** https://eliochen.github.io/postdoc-tracker/

---

## ✨ 功能特性

### 🗂 申请追踪

| 功能 | 说明 |
|------|------|
| **统计仪表盘** | 7 个状态卡片（全部 / 已联系 / 已网申 / 面试中 / 未回复 / 已拒绝 / 已录取），点击可过滤 |
| **完整字段** | 导师姓名、职称、学校、院系、国家、QS 排名、H 指数、近5年一区论文数、研究方向、课题组主页、Google Scholar、经费来源、联系邮箱、联系方式、申请日期、截止日期、申请系统链接、面试日期、跟进日期、备注 |
| **状态快切** | 点击状态徽章弹出下拉，一键切换，无需开编辑窗 |
| **搜索 & 排序** | 实时搜索导师/学校/国家，8 种排序方式（申请时间、等待天数、截止日期、QS 排名、H 指数等） |
| **截止日期预警** | ≤ 7 天红色紧迫标签，≤ 30 天橙色提示 |
| **等待天数** | 自动计算，> 30 天变橙，> 60 天变红 |
| **导出 CSV** | 含 BOM，Excel 可直接打开中文 |
| **本地持久化** | 数据存储在浏览器 localStorage，刷新不丢失 |

### 🤖 智能自动补全

| 字段 | 数据来源 | 自动填充内容 |
|------|---------|------------|
| 导师姓名 | [OpenAlex](https://openalex.org) 免费 API | H 指数、所在机构、Google Scholar 链接 |
| 学校名称 | 内嵌约 150 所顶校数据库 | 国家国旗 🇺🇸🇬🇧🇩🇪、QS 2025 排名、国家名称 |

### 📢 岗位广告

- **RSS 自动聚合**：从 EURAXESS、jobs.ac.uk、Nature Careers 实时拉取最新岗位
- **快捷跳转**：一键直达 10 大求职平台

| 平台 | 特点 |
|------|------|
| [Nature Careers](https://www.nature.com/naturecareers/jobs/filter/postdoc) | 顶刊官方招聘 |
| [Science AAAS](https://jobs.sciencecareers.org/jobs/?q=postdoc) | Science 旗下 |
| [AcademicJobsOnline](https://academicjobsonline.org/ajo/jobs) | 学术职位专属 |
| [EURAXESS](https://euraxess.ec.europa.eu/jobs) | 欧洲研究职位 |
| [jobs.ac.uk](https://www.jobs.ac.uk/search/?keywords=postdoc) | 英国学术就业 |
| [LinkedIn](https://www.linkedin.com/jobs/search/?keywords=postdoc) | 全球最大职场社交 |
| [Twitter / X](https://x.com/search?q=%23PostdocPosition+OR+%23AcademicJobs) | 实时动态 `#PostdocPosition` |
| [Bluesky](https://bsky.app/search?q=postdoc+chemistry+biology) | 学术圈新兴平台 |
| [ResearchGate](https://www.researchgate.net/jobs/search?q=postdoc) | 学者社区招聘 |
| [Indeed](https://www.indeed.com/jobs?q=postdoc+chemistry+biology) | 综合搜索引擎 |

---

## 🖼 界面预览

```
┌─────────────────────────────────────────────────────────────┐
│  🎓 博士后申请追踪          [我的申请] [岗位广告]   [+ 添加]  │
├─────────────────────────────────────────────────────────────┤
│  全部  已联系  已网申  面试中  未回复  已拒绝  已录取          │
│   12     3      4      1      2      1       1               │
├─────────────────────────────────────────────────────────────┤
│  🔍 搜索...  [全部▾]  排序: 申请时间↓                         │
├──────────────┬───────┬──────────┬──────────┬──────┬────────┤
│ 导师 / 学校  │ 链接  │ 指数/论文 │ 日期     │ 天数 │ 状态   │
├──────────────┼───────┼──────────┼──────────┼──────┼────────┤
│ Cravatt      │ 🔬🔗  │ h=85     │ 申：1/15 │ 42天 │ 面试中 │
│ 🇺🇸 Scripps   │       │ 12篇一区 │ 截：3/01 │      │        │
└──────────────┴───────┴──────────┴──────────┴──────┴────────┘
```

---

## 🚀 本地运行

此项目为纯静态网页，无需任何构建步骤：

```bash
# 克隆仓库
git clone https://github.com/ElioChen/postdoc-tracker.git
cd postdoc-tracker

# 直接用浏览器打开（推荐）
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux

# 或用任意静态服务器
npx serve .
python -m http.server 8080
```

---

## 📁 项目结构

```
postdoc-tracker/
├── index.html          # 页面结构（两个 Tab：我的申请 / 岗位广告）
├── style.css           # 样式（CSS 变量 + 响应式布局）
├── app.js              # 应用逻辑
│   ├── 大学数据库       # ~150 所顶校，含 QS 排名和国家代码
│   ├── OpenAlex 补全   # 导师姓名自动补全
│   ├── 大学补全         # 学校名称自动补全 + 国旗 + 排名
│   ├── RSS 拉取         # 多平台岗位广告聚合
│   └── LocalStorage    # 本地数据持久化
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions 自动部署
└── .nojekyll           # 禁用 GitHub Pages 的 Jekyll 处理
```

---

## 📊 申请状态说明

| 状态 | 颜色 | 含义 |
|------|------|------|
| 🔵 已联系 | 蓝色 | 已发邮件或 LinkedIn 联系，等待回复 |
| 🟣 已网申 | 紫色 | 已通过官方系统提交申请材料 |
| 🟢 面试中 | 绿色 | 已安排面试或面试进行中 |
| 🟡 未回复 | 橙色 | 联系后超过一定时间无回音 |
| 🔴 已拒绝 | 红色 | 收到拒绝通知 |
| 🟩 已录取 | 绿色 | 收到 Offer！🎉 |

---

## 🛠 技术栈

- **纯前端**：HTML5 + CSS3 + Vanilla JavaScript（无框架依赖）
- **数据存储**：浏览器 localStorage
- **API**：
  - [OpenAlex](https://docs.openalex.org) — 开放学术数据库，导师信息自动补全
  - [rss2json.com](https://rss2json.com) — RSS → JSON 代理，用于岗位广告聚合
- **部署**：GitHub Pages + GitHub Actions

---

## 📝 数据说明

- 所有申请数据**仅存储在本地浏览器**，不上传任何服务器
- 更换浏览器或清除缓存会导致数据丢失，建议定期使用"导出 CSV"备份
- QS 排名数据基于 QS World University Rankings 2025

---

## 🤝 贡献

欢迎提交 Issue 或 PR：

- 增加更多大学数据库条目
- 增加新的 RSS 岗位来源
- 界面优化和功能建议

---

<p align="center">
  Made with ❤️ · Powered by <a href="https://claude.ai">Claude</a>
</p>
