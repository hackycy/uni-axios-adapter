'use strict';
const { buildFullPath, settle, createError } = require('./helper');

/**
 * uni request axios adapter
 * config api link https://github.com/axios/axios#request-config
 * xhrAdapter link https://github.com/axios/axios/blob/master/lib/adapters/xhr.js
 */
module.exports = function uniAdapter(config) {
  return new Promise(function(resolve, reject) {
    const method = config.method.toUpperCase() || 'GET';
    let requestData = method === 'GET' ? config.params : config.data;
    let requestHeaders = config.headers;
    // only support android
    const sslVerify = config.sslVerify || true;
    // only support h5
    const withCredentials = config.withCredentials || false;
    // only support android
    const firstIpv4 = config.firstIpv4 || false;
    const responseType = config.responseType || 'json';

    // HTTP basic authentication
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password
        ? unescape(encodeURIComponent(config.auth.password))
        : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    const fullpath = buildFullPath(config.baseURL, config.url);

    let requestTask;
    // only support single file upload
    if (
      requestData &&
      method === 'POST' &&
      requestHeaders['Content-Type'] === 'multipart/form-data'
    ) {
      /**
       * data need item [ fileType, filePath, name ]
       */
      const requestFormData = {};
      const requestOtherFormData = {};
      let tmpObj;
      try {
        tmpObj = JSON.parse(requestData);
      } catch (e) {
        tmpObj = {};
      }
      // formdata transfer to obj
      Object.keys(tmpObj).forEach(function(key) {
        if (['fileType', 'filePath', 'name'].indexOf(key) === -1) {
          requestOtherFormData[key] = tmpObj[key];
        } else {
          requestFormData[key] = tmpObj[key];
        }
      });

      // https://uniapp.dcloud.io/api/request/network-file?id=uploadfile
      requestTask = uni.uploadFile({
        url: fullpath,
        name: requestFormData.name,
        filePath: requestFormData.filePath,
        fileType: requestFormData.fileType,
        header: requestHeaders,
        timeout: config.timeout,
        formData: requestOtherFormData,
        success: function(res) {
          const response = {
            data: res.data,
            status: res.statusCode,
            statusText: res.statusCode === 200 ? 'OK' : 'ERROR',
            headers: null,
            config,
            request: null
          };
          settle(resolve, reject, response);
        },
        fail: function(e) {
          reject(createError(e.errMsg || 'Network Error', config, null, null));
        }
      });

      // Handle progress if needed
      if (typeof config.onUploadProgress === 'function') {
        requestTask.onProgressUpdate = config.onUploadProgress;
      }
    } else if (
      requestData &&
      method === 'GET' &&
      typeof config.onDownloadProgress === 'function'
    ) {
      // https://uniapp.dcloud.io/api/request/network-file?id=downloadfile
      requestTask = uni.downloadFile({
        url: fullpath,
        header: requestHeaders,
        timeout: config.timeout,
        success: function(res) {
          const response = {
            data: { tempFilePath: res.tempFilePath },
            status: res.statusCode,
            statusText: res.statusCode === 200 ? 'OK' : 'ERROR',
            headers: null,
            config,
            request: null
          };
          settle(resolve, reject, response);
        },
        fail: function(e) {
          reject(createError(e.errMsg || 'Network Error', config, null, null));
        }
      });

      requestTask.onProgressUpdate = config.onDownloadProgress;
    } else {
      // https://uniapp.dcloud.io/api/request/request
      requestTask = uni.request({
        url: fullpath,
        method,
        data: requestData || null,
        header: requestHeaders,
        sslVerify,
        withCredentials,
        dataType: responseType,
        responseType: responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
        timeout: config.timeout,
        firstIpv4,
        success: function(res) {
          const response = {
            data: res.data,
            status: res.statusCode,
            statusText: res.statusCode === 200 ? 'OK' : 'ERROR',
            headers: res.header,
            config,
            request: null
          };
          settle(resolve, reject, response);
        },
        fail: function(e) {
          reject(createError(e.errMsg || 'Network Error', config, null, null));
        }
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!requestTask) {
          return;
        }
        requestTask.abort();
        reject(cancel);
        // clean up request
        requestTask = null;
      });
    }
  });
};
