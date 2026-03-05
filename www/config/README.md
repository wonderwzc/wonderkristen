# 克丽斯腾项目 - 配置与脚本

## 运行方式

所有 npm 命令需在 `config/` 目录下执行，或使用 `npm --prefix config` 从项目根目录执行。

```bash
# 本地启动（在 config 目录下）
cd config
npm install
npm start

# 或从项目根目录
npm --prefix config install
npm --prefix config start

# 复制到 www 并同步 Capacitor
npm --prefix config run cap:copy
npm --prefix config run cap:sync
```
