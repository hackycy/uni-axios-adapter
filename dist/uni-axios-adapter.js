(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["uni-axios-adapter"] = factory();
	else
		root["uni-axios-adapter"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 10:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(303);

/***/ }),

/***/ 303:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable no-undef */
const { buildFullPath, settle, createError } = __webpack_require__(791);

/**
 * uni request axios adapter
 * config api link https://github.com/axios/axios#request-config
 * xhrAdapter link https://github.com/axios/axios/blob/master/lib/adapters/xhr.js
 */
module.exports = function uniAdapter(config) {
  return new Promise(function (resolve, reject) {
    const method = config.method.toUpperCase() || "GET";
    let requestData = method === "GET" ? config.params : config.data;
    let requestHeaders = config.headers;
    // only support android
    const sslVerify = config.sslVerify || true;
    // only support h5
    const withCredentials = config.withCredentials || false;
    // only support android
    const firstIpv4 = config.firstIpv4 || false;
    const responseType = config.responseType || "json";

    // HTTP basic authentication
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password
        ? unescape(encodeURIComponent(config.auth.password))
        : "";
      requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
    }

    const fullpath = buildFullPath(config.baseURL, config.url);

    let requestTask;
    // only support single file upload
    if (
      requestData &&
      method === "POST" &&
      requestHeaders["Content-Type"] === "multipart/form-data"
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
      Object.keys(tmpObj).forEach(function (key) {
        if (["fileType", "filePath", "name"].indexOf(key) === -1) {
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
        success: function (res) {
          const response = {
            data: res.data,
            status: res.statusCode,
            statusText: res.statusCode === 200 ? "OK" : "ERROR",
            headers: null,
            config,
            request: null,
          };
          settle(resolve, reject, response);
        },
        fail: function (e) {
          reject(createError(e.errMsg || "Network Error", config, null, null));
        },
      });

      // Handle progress if needed
      if (typeof config.onUploadProgress === "function") {
        requestTask.onProgressUpdate = config.onUploadProgress;
      }
    } else if (
      requestData &&
      method === "GET" &&
      typeof config.onDownloadProgress === "function"
    ) {
      // https://uniapp.dcloud.io/api/request/network-file?id=downloadfile
      requestTask = uni.downloadFile({
        url: fullpath,
        header: requestHeaders,
        timeout: config.timeout,
        success: function (res) {
          const response = {
            data: { tempFilePath: res.tempFilePath },
            status: res.statusCode,
            statusText: res.statusCode === 200 ? "OK" : "ERROR",
            headers: null,
            config,
            request: null,
          };
          settle(resolve, reject, response);
        },
        fail: function (e) {
          reject(createError(e.errMsg || "Network Error", config, null, null));
        },
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
        responseType: responseType === "arraybuffer" ? "arraybuffer" : "text",
        timeout: config.timeout,
        firstIpv4,
        success: function (res) {
          const response = {
            data: res.data,
            status: res.statusCode,
            statusText: res.statusCode === 200 ? "OK" : "ERROR",
            headers: res.header,
            config,
            request: null,
          };
          settle(resolve, reject, response);
        },
        fail: function (e) {
          reject(createError(e.errMsg || "Network Error", config, null, null));
        },
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


/***/ }),

/***/ 791:
/***/ ((module) => {

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  // eslint-disable-next-line no-useless-escape
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
}

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
    : baseURL;
}

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
}

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
    };
  };
  return error;
}

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(
      createError(
        "Request failed with status code " + response.status,
        response.config,
        null,
        response.request,
        response
      )
    );
  }
}

module.exports = { buildFullPath, settle, createError };


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(10);
/******/ })()
;
});
//# sourceMappingURL=uni-axios-adapter.map