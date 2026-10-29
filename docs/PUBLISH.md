# 发布与推送指南

## 当前状态

| 项 | 状态 |
|----|------|
| 包名 | `@linzhang1122/web-harness` |
| 远程仓库 | 已配置 `origin` → https://github.com/Baobao-1122/xseed-web-harness.git |
| 发布到 npm | ✅ 0.2.0 已发布 |

---

## 1. 推送到 GitHub

```bash
cd "/Users/linlin/Documents/myCompany/Formal work/xseed-web-harness"

# 若未登录 GitHub CLI
gh auth login

# 推送（HTTPS 失败可改用 SSH remote）
git push -u origin main
```

若 `git push` 提示用户名密码，建议改用 SSH：

```bash
git remote set-url origin git@github.com:Baobao-1122/xseed-web-harness.git
git push -u origin main
```

---

## 2. 发布到 npm（@linzhang1122/web-harness）

### 前置条件

1. 用 npm 账号 `linzhang1122` 发布；包名的 scope 与账号同名，不需要另建组织
2. 本机已登录：

```bash
npm login
npm whoami
```

### 发布命令

> 若本机 npm 默认 registry 为淘宝镜像（npmmirror），**发布必须指定官方源**。

```bash
cd "/Users/linlin/Documents/myCompany/Formal work/xseed-web-harness"

npm login --registry=https://registry.npmjs.org
npm whoami --registry=https://registry.npmjs.org

pnpm test && pnpm build
npm publish --access public --registry=https://registry.npmjs.org
```

`prepack` 会自动跑测试并构建。

### 验证

```bash
npm view @linzhang1122/web-harness version --registry=https://registry.npmjs.org
```

---

## 3. 项目改用 npm 安装

`package.json` 中把：

```json
"@linzhang1122/web-harness": "file:../xseed-web-harness"
```

改为：

```json
"@linzhang1122/web-harness": "^0.2.0"
```

然后：

```bash
cd <项目目录>
pnpm install
pnpm test:harness:doctor
```

---

## 版本升级

```bash
# patch: 0.2.0 → 0.2.1
npm version patch
git push origin main --tags
npm publish --access public
```
