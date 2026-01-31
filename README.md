# 投票系统后台管理前端

## 技术栈
- Vue 3
- TypeScript
- Vite
- Element Plus
- Tailwind CSS
- Pinia
- Vue Router
- ECharts
- Axios

## 安装依赖
```bash
npm install
```

## 开发运行
```bash
npm run dev
```

访问 http://localhost:3001

## 构建生产版本
```bash
npm run build
```

## 项目结构
```
src/
├── api/              # API 服务层
├── components/       # 公共组件
│   └── Layout/       # 布局组件
├── router/           # 路由配置
├── types/            # TypeScript 类型定义
├── views/            # 页面组件
│   ├── ProjectTypes/ # 项目类型管理
│   ├── Projects/     # 项目管理
│   ├── Experts/      # 专家管理
│   ├── LoginLogs/    # 登录日志
│   ├── Votes/        # 投票管理
│   └── Statistics/   # 统计分析
├── App.vue
└── main.ts
```

## 功能模块
1. **项目类型管理** - 项目类型的增删改查
2. **项目管理** - 项目的增删改查、批量导入
3. **专家管理** - 专家的增删改查、批量导入
4. **登录日志** - 查看专家登录记录
5. **投票管理** - 查看投票记录
6. **统计分析** - 数据统计和可视化
