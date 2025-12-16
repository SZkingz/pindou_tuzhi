# GitHub Pages 完整部署指南
从注册账号到获取公开访问URL的详细步骤

## 一、注册GitHub账号
1. 打开浏览器访问：https://github.com/signup
2. 填写注册信息：
   - 邮箱地址（推荐使用常用邮箱）
   - 密码（至少15个字符或包含数字+符号）
   - 用户名（将作为GitHub Pages URL的一部分）
3. 验证邮箱：点击GitHub发送的验证邮件中的链接
4. 完成注册流程

## 二、创建GitHub仓库
1. 登录GitHub后，点击右上角的 `+` 号 → 选择 `New repository`
2. 填写仓库信息：
   - **Repository name**：输入仓库名称（推荐使用 `pixels-art-tool` 或其他有意义的名称）
   - **Description**（可选）：描述你的像素化工具网站
   - **Public**：选择公开仓库（GitHub Pages需要公开仓库才能免费使用）
   - **Initialize this repository with**：**不要勾选任何选项**
3. 点击 `Create repository` 按钮

## 三、安装Git客户端（Windows）
1. 访问Git官网：https://git-scm.com/downloads
2. 点击 "Windows" 下载安装包
3. 运行安装包，使用默认选项完成安装
4. 验证安装：
   - 按下 `Win + R` → 输入 `cmd` → 打开命令提示符
   - 输入 `git --version`
   - 如果显示版本号（如 `git version 2.43.0.windows.1`），说明安装成功

## 四、配置Git
1. 打开命令提示符，输入以下命令（替换为你的GitHub信息）：
   ```bash
   git config --global user.name "你的GitHub用户名"
   git config --global user.email "你的GitHub注册邮箱"
   ```
2. 验证配置：
   ```bash
   git config --list
   ```
   确保显示的用户名和邮箱正确

## 五、上传本地代码到GitHub

### 1. 打开项目目录
   ```bash
   cd C:/Users/32231/Desktop/pindou/pindou1
   ```

### 2. 初始化本地Git仓库
   ```bash
   git init
   ```
   执行后会在项目目录中创建一个 `.git` 隐藏文件夹

### 3. 添加所有文件到暂存区
   ```bash
   git add .
   ```
   注意：`.` 代表当前目录下的所有文件

### 4. 提交代码到本地仓库
   ```bash
   git commit -m "Initial commit: 像素化工具网站"
   ```

### 5. 连接到GitHub仓库
   复制你创建的GitHub仓库的URL（在仓库页面点击 `<> Code` → 复制HTTPS链接，如 `https://github.com/你的用户名/你的仓库名.git`）
   
   ```bash
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   ```

### 6. 推送代码到GitHub
   ```bash
   git push -u origin main
   ```
   - 首次推送会弹出GitHub登录窗口，输入你的GitHub账号和密码（或使用Token）
   - 如果使用2FA（两步验证），需要创建一个Personal Access Token

### 7. 验证推送结果
   刷新你的GitHub仓库页面，应该能看到所有项目文件已经上传成功

## 六、启用GitHub Pages功能

### 1. 进入仓库设置
   - 在GitHub仓库页面点击顶部的 `Settings` 标签

### 2. 找到Pages设置
   - 在左侧菜单中向下滚动，找到 `Pages` 选项

### 3. 配置Pages
   - **Source** 部分：
     - 点击 `Branch` 下拉菜单 → 选择 `main`
     - 选择文件夹：点击下拉菜单 → 选择 `/pindou1` 子目录
     - 点击 `Save` 按钮

### 4. 等待部署完成
   - 保存后，页面会显示 "Your site is being deployed"
   - GitHub Pages部署通常需要1-2分钟完成

## 七、获取公开访问URL

### 1. 查看部署状态
   - 在 `Settings > Pages` 页面，向下滚动查看 "Build and deployment" 部分
   - 当状态显示 "Your site is published at..." 时，说明部署完成

### 2. 复制公开URL
   - URL格式：`https://你的用户名.github.io/你的仓库名/`
   - 点击URL旁边的复制按钮，即可获得完整的公开访问链接

### 3. 测试访问
   - 在浏览器中粘贴URL，应该能正常访问你的像素化工具网站
   - 分享这个URL给他人，他们也可以在任意设备上访问

## 八、后续更新网站
当你修改了本地代码后，只需执行以下命令即可更新GitHub Pages：

```bash
# 添加所有修改的文件
git add .

# 提交修改
git commit -m "更新说明：修改了XX功能"

# 推送到GitHub
git push origin main
```

更新后，GitHub Pages会自动重新部署（通常需要1-2分钟生效）

## 九、常见问题与解决方案

### 1. 推送时需要Token而不是密码
GitHub现在要求使用Personal Access Token代替密码：
- 登录GitHub → 点击右上角头像 → `Settings` → `Developer settings` → `Personal access tokens` → `Tokens (classic)` → `Generate new token`
- 勾选 `repo` 权限 → 生成Token → **复制并保存好Token**
- 推送时密码框中输入这个Token

### 2. GitHub Pages部署失败
- 检查仓库是否为公开仓库
- 确保 `index.html` 文件在根目录
- 等待几分钟后刷新页面重试
- 查看 `Settings > Pages` 页面的部署日志

### 3. URL访问显示404
- 确认URL是否正确（注意大小写）
- 等待部署完成
- 检查 `index.html` 是否存在且正确命名

### 4. 图片或CSS文件无法加载
- 确保所有资源使用相对路径（如 `./style.css` 而不是 `http://localhost/style.css`）
- 检查文件路径是否正确

## 十、额外优化建议

### 1. 自定义域名（可选）
如果想使用自己的域名（如 `www.my-pixels-tool.com`）：
- 购买域名（推荐：阿里云、腾讯云、Namecheap）
- 在 `Settings > Pages` 页面的 `Custom domain` 中添加你的域名
- 按照GitHub的提示配置DNS解析

### 2. 查看访问统计
- 在 `Settings > Pages` 页面可以查看网站访问统计
- 或使用第三方工具（如Google Analytics）

### 3. 启用HTTPS
GitHub Pages默认启用HTTPS，确保网站安全访问

---

现在你已经完成了所有步骤，可以通过公开URL访问你的像素化工具网站了！

如果遇到任何问题，可以查看GitHub Pages官方文档：https://docs.github.com/zh/pages