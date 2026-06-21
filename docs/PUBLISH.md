# 发布与推送指南

## 当前状态

| 项 | 状态 |
|----|------|
| 本地 Git 提交 | ✅ `main` @ `738db3b`（0.2.0） |
| 远程仓库 | 已配置 `origin` → https://github.com/Baobao-1122/xseed-web-harness.git |
| 推送到 GitHub | ⏳ **需你在本机登录后执行** |
| 发布到 npm | ⏳ **需你在本机 `npm login` 后执行** |

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

## 2. 发布到 npm（@xseed/web-harness）

### 前置条件

1. 拥有 npm 账号，且能发布 **`@xseed` scope**（需在 [npmjs.com](https://www.npmjs.com) 创建组织 `xseed`，或使用已有组织）
2. 本机已登录：

```bash
npm login
npm whoami
```

### 发布命令

```bash
cd "/Users/linlin/Documents/myCompany/Formal work/xseed-web-harness"

pnpm install
pnpm test
pnpm build
npm publish --access public
```

`prepack` 会自动跑测试并构建。

### 验证

```bash
npm view @xseed/web-harness version
```

---

## 3. saa-s-ui 改用 npm 安装（发布后可选）

`package.json` 中把：

```json
"@xseed/web-harness": "file:../xseed-web-harness"
```

改为：

```json
"@xseed/web-harness": "^0.2.0"
```

然后：

```bash
cd saa-s-ui
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
