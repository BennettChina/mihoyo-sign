<div align="center">
    <img src="public/images/miyouji.png" alt="avatar/logo" width="200" height="200">
</div>
<div align="center">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/BennettChina/mihoyo-sign">
    <a target="_blank" href="https://raw.githubusercontent.com/BennettChina/mihoyo-sign/master/LICENSE">
		<img alt="Repo License" src="https://img.shields.io/github/license/BennettChina/mihoyo-sign">
	</a>
    <a target="_blank" href='https://github.com/BennettChina/mihoyo-sign/stargazers'>
		<img src="https://img.shields.io/github/stars/BennettChina/mihoyo-sign.svg?logo=github" alt="github star"/>
	</a>
</div>

<h2 align="center">米哈游签到插件</h2>

## 🧑‍💻简介

**米哈游签到插件** 为 [Adachi-BOT](https://github.com/SilveryStar/Adachi-BOT)
衍生插件，用于处理米游社的签到功能。

## 🛠️ 安装方式

在 `Adachi-BOT/src/plugins` 目录执行下面的命令。

```shell
git clone https://mirror.ghproxy.com/https://github.com/BennettChina/mihoyo-sign.git
```

## 🎁 更新方式

### 💻 命令行更新

在插件目录执行下面的命令即可。

```shell
git pull
```

### 📱 指令更新

可使用 `#upgrade_plugins 米游社签到` 指令来更新本插件。

## 🧰 指令列表

| 指令名        | 参数     | 描述            |
|------------|--------|---------------|
| `#米游社签到`   | 绑定账户序号 | 为绑定的米游社账号进行签到 |
| `#我的米游社账号` | 无      | 查询绑定的米游社账号    |

## 配置参数

```yaml
captcha:
  # 手动处理人机验证码的地址
  viewUrl: ""
  # 获取手动处理验证码结果的API地址
  apiUrl: ""
  auto:
    enabled: false
    # 自动打码的API地址
    api: ""
    # 自动打码需要的参数（gt,challenge 已默认传入）
    params:
      # 示例参数：token
      token: ""
    # 请求 API 的 method
    method: post
    # 请求 API 的请求头，默认传入 User-Agent: Adachi-Bot/<adachi-version> mihoyo-sign/<plugin-version>
    headers:
      # 示例请求头
      Content-Type: application/json
    # 接口响应结构
    response:
      # code 字段名
      codeFieldName: code
      # 错误信息字段名
      messageFieldName: message
      # 返回数据字段名
      dataFieldName: data
      # validate 的字段名
      validateFieldName: validate
      # 表示请求成功的值
      successCode: "0"
alias:
  - 米游社签到
```

### 打码服务

项目提供了使用 Vercel 部署的在线地址以及 Render 部署的 API 服务，流量高也可自行部署以下服务。

- [gt-manual](https://github.com/BennettChina/gt-manual)
- [awesome-api](https://github.com/BennettChina/awesome-api)
