# 网站部署指南：让你的像素化工具随时可访问

## 当前状态说明
目前你的网站是在**本地计算机**上运行的（通过 `python -m http.server 8000`），只能在你自己的电脑上访问。要让手机和他人也能访问，需要将网站**部署到互联网上的静态托管服务**。

## 部署解决方案：使用免费静态托管服务
由于这是纯前端网站（无后端），可以使用**免费的静态网站托管服务**。以下是推荐的平台和详细步骤：

---

### 推荐平台（均免费）
1. **GitHub Pages** - 最流行，与GitHub无缝集成
2. **Netlify** - 部署简单，支持自动更新
3. **Vercel** - 专注前端，速度快
4. **Cloudflare Pages** - 全球CDN，访问速度快

---

### 详细部署步骤（以GitHub Pages为例）

#### 第一步：准备GitHub仓库
1. 注册/登录 [GitHub](https://github.com/)
2. 创建一个**新仓库**（仓库名建议用 `pixels-art-tool` 或其他你喜欢的名字）
3. 本地项目文件夹中，使用Git初始化并上传代码：
   ```bash
   # 1. 进入项目文件夹
   cd C:/Users/32231/Desktop/pindou/pindou1
   
   # 2. 初始化Git仓库
   git init
   
   # 3. 添加所有文件
   git add .
   
   # 4. 提交代码
   git commit -m "Initial commit: 像素化工具"
   
   # 5. 关联GitHub仓库（替换为你的仓库URL）
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   
   # 6. 上传代码到GitHub
   git push -u origin main
   ```

#### 第二步：启用GitHub Pages
1. 进入GitHub仓库 → 点击 `Settings`（设置）
2. 左侧菜单选择 `Pages`
3. 在 `Build and deployment` 部分：
   - `Source` 选择 `Deploy from a branch`
   - `Branch` 选择 `main`，`/root`（根目录）
   - 点击 `Save`（保存）
4. 等待几秒钟，页面顶部会显示：
   ```
   Your site is live at https://你的用户名.github.io/你的仓库名/
   ```

---

### 其他平台部署（简化版）

#### Netlify部署
1. 注册/登录 [Netlify](https://www.netlify.com/)
2. 点击 `Add new site` → `Import an existing project`
3. 选择 `GitHub` → 授权并选择你的仓库
4. 点击 `Deploy site`（无需额外配置）
5. 部署完成后获得访问URL

#### Vercel部署
1. 注册/登录 [Vercel](https://vercel.com/)
2. 点击 `New Project` → 选择 `GitHub` 并授权
3. 选择你的仓库 → 点击 `Deploy`
4. 部署完成后获得访问URL

---

## 访问和分享
部署完成后，你将获得一个**公开的URL**（例如：`https://你的用户名.github.io/你的仓库名/`）：

### 📱 手机访问
直接在手机浏览器中输入URL即可，网站已做响应式设计，支持移动端。

### 📤 分享给他人
将URL发送给朋友即可，他们可以在任何设备上访问。

---

## 自定义域名（可选）
如果你想使用自己的域名（如 `www.my-pixels-tool.com`）：
1. 购买域名（推荐：阿里云、腾讯云、Namecheap）
2. 在托管平台的设置中添加自定义域名
3. 按照平台提示配置DNS解析

---

## 更新网站
当你修改了本地代码后，只需重新上传到GitHub，托管平台会**自动重新部署**（GitHub Pages可能需要1-2分钟更新）。

---

## 注意事项
1. 所有图片和资源必须使用**相对路径**（当前代码已正确使用）
2. 确保 `index.html` 是根目录下的主文件
3. 部署后测试所有功能，特别是图片上传和像素化功能

---

## 紧急访问备选方案
如果暂时不想部署，可以使用 **临时文件分享工具**：
- 将整个项目文件夹压缩为ZIP
- 发送给他人，对方解压后：
  - 电脑：双击 `index.html` 或本地运行服务器
  - 手机：使用支持本地HTML的文件浏览器（如iOS的 "Documents" 应用）

但这种方式每次更新都需要重新发送，不如部署方便。