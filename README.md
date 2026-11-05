# 星萤经营管理系统 · 微信小程序
适用场景：店铺需要会员储值系统、预约系统、商城系统等。
已验证场景/已接入案例：理发店会员充值、美妆美甲店预约、社区跑腿小程序、大学跑腿小程序、便利店、餐饮店、花店、奶茶店。
系统包含：微信小程序（顾客充值、点单、预约、支付等功能）+电脑管理端（商家在后台查看经营数据、流水、对账、管理员工等），以及一套后端。

本仓库是小程序端，客人用的店内小程序（点单、预约、会员、优惠券），商家也可以在「我的」里看订单、核销、合同。和 PC 后台共用 [xy-control-java](https://github.com/HQian0526/xy-control-java) 接口。

| 仓库 | 说明 |
|------|------|
| [xy-community-sapp](https://github.com/HQian0526/xy-community-sapp) | 本仓库，uni-app 小程序 |
| [xy-vben-admin](https://github.com/HQian0526/xy-vben-admin) | PC 管理端 |
| [xy-control-java](https://github.com/HQian0526/xy-control-java) | Java 后端 |

> 想上线或让作者帮你部署：邮箱 **xingying003@126.com**，GitHub [@HQian0526](https://github.com/HQian0526)。

## 能做什么

- 首页点单、购物车、下单（可接微信支付）
- 优惠券、促销、储值
- 我的：订单、核销、会员、店铺资料
- 商家合同：查看、手写签名
- 按店铺开关支付、储值、公告等

## 技术栈

- uni-app（Vue 2）
- uView Plus
- 微信小程序

建议用 [HBuilderX](https://www.dcloud.io/hbuilderx.html) App 开发版打开本目录。

## 本地运行

1. 先启动后端 `xy-control-java`。

2. 改接口地址 `common/api/config.js`：

```js
// 开发者工具可以用 localhost
export const API_BASE_URL = 'http://localhost:8080/api'
// 真机必须改成电脑局域网 IP，例如：
// export const API_BASE_URL = 'http://192.168.1.8:8080/api'
```

文件域名 `FILE_BASE_URL` 改成你的 COS / CDN。业务请求不要再重复写 `/api` 前缀。

3. HBuilderX 运行到微信开发者工具。微信公众平台把开发者工具、局域网 IP 配进 request 合法域名（开发阶段可勾选不校验）。

4. 后端填好小程序 `app-id`、`app-secret` 才能微信登录。

## 目录（简要）

```
pages/mall/                 点单、商品、结算
pages/personalCenter/       我的、订单、合同、核销等
common/api/                 接口封装，根地址在 config.js
```

## 上线

需要微信小程序账号、类目与类目资质、服务器域名 HTTPS、（可选）微信支付。提交审核前把 `API_BASE_URL` 改成线上网关。

**也可以把小程序 AppID、类目、要不要支付发给 963497073@qq.com**，作者按这套代码帮你配置和部署。

## 说明

- 早期从 uni-app 示例工程改来，部分配置名可能仍带 hello-uniapp
- 学习与对接可以自用；商用部署请先联系作者
