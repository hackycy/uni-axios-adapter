# uni-axios-adapter

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/uni-axios-adapter.svg?style=flat-square
[npm-url]: https://npmjs.org/package/uni-axios-adapter
[download-image]: https://img.shields.io/npm/dm/uni-axios-adapter.svg?style=flat-square
[download-url]: https://npmjs.org/package/uni-axios-adapter

[axios adapter](https://github.com/axios/axios) for uni-app.

## 安装

``` bash
$ npm install --save uni-axios-adapter axios
```

## 使用

``` javascript
// request.js
import axios from 'axios'
import uniAdapter from 'uni-axios-adapter'

// create an axios instance
const service = axios.create({
  adapter: uniAdapter,
  baseURL: 'http://127.0.0.1:7001', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

export default service
```

**发起请求**

``` javascript
// api.js
import request from "./utils/request";

export function postData(data) {
  return request({
    url: '/your/api/url',
    method: 'POST',
    data
  })
}
```

> 与axios使用无差别。

# 差异

## 配置`config`

默认使用`uni.request`发起请求，但在特定条件下会自动变换成`uni.uploadFile`或`uni.downloadFile`。

| 参数               | 类型                      | 默认值     | 说明                                                         |
| ------------------ | ------------------------- | ---------- | ------------------------------------------------------------ |
| adapter            | Function                  | uniAdapter | 自定义适配器                                                 |
| baseURL            | String                    |            | 基础地址                                                     |
| url                | String                    |            | 请求地址                                                     |
| method             | String                    | get        | 请求方法                                                     |
| params             | Object                    |            | 请求参数                                                     |
| data               | String/Object/ArrayBuffer |            | 请求数据                                                     |
| headers            | Object                    |            | 请求头，当Header中Content-Type赋值为multipart/form-data时会自动使用uni.uploadFile |
| paramsSerializer   | Function                  |            | 在Get请求时会自动将params赋值给uni-app的data                 |
| cancelToken        | Object                    |            | 取消令牌                                                     |
| timeout            | Number                    | 5000       | 超时时间                                                     |
| responseType       | String                    | Json       | 会直接将该值自动赋值给uni中的dataType，但同时赋值给uni中的responseType，非arraybuffer时全都转为text |
| sslVerify          | Boolean                   | true       | 增加字段，等同uni-app配置                                    |
| withCredentials    | Boolean                   | false      | 增加字段，等同uni-app配置                                    |
| firstIpv4          | Boolean                   | false      | 增加字段，等同uni-app配置                                    |
| onDownloadProgress | Function                  |            | 当该值赋值时且method为get时会自动使用uni.downloadFile        |
| onUploadProgress   | Function                  |            | 在使用uni.uploadFIle时生效                                   |

# 有问题或Bug

请提出[issues](https://github.com/hackycy/uni-axios-adapter/issues)

# License

[MIT](LICENSE)