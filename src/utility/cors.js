"use strict";

/*jshint node:true */

var simpleMethods, simpleRequestHeaders, simpleResponseHeaders, toLowerCase, checkOriginMatch, origin;


Object.defineProperty(exports, "simpleMethods", {
    get: function () {
        return [
            "GET",
            "HEAD",
            "POST",
            "PUT",
            "DELETE"
        ];
    }
});
simpleMethods = exports.simpleMethods;


Object.defineProperty(exports, "origin", {
    get: function () {
        return ["http://localhost:3000"];
    }
});
origin = exports.origin;


Object.defineProperty(exports, "simpleRequestHeaders", {
    get: function () {
        return [
            "accept",
            "accept-language",
            "content-language",
            "content-type",
            "authorization",
            "token"
        ];
    }
});
simpleRequestHeaders = exports.simpleRequestHeaders;


Object.defineProperty(exports, "simpleResponseHeaders", {
    get: function () {
        return [
            "cache-control",
            "content-language",
            "content-type",
            "expires",
            "last-modified",
            "pragma"
        ];
    }
});
simpleResponseHeaders = exports.simpleResponseHeaders;

toLowerCase = function (array) {
    return array.map(function (el) {
        return el.toLowerCase();
    });
};

checkOriginMatch = function (originHeader, origins, callback) {
    if (typeof origins === "function") {
        origins(originHeader, function (err, allow) {
            callback(err, allow);
        });
    } else if (origins.length > 0) {
        callback(null, origins.some(function (origin) {
            return origin === originHeader;
        }));
    } else {
        callback(null, true);
    }
};

exports.create = function (options) {
    options = options || {};
    options.origins = options.origins || origin;
    options.methods = options.methods || simpleMethods;

    /**
     * 
     */
    if (options.hasOwnProperty("requestHeaders") === true) {
        options.requestHeaders = toLowerCase(options.requestHeaders);
    } else {
        options.requestHeaders = simpleRequestHeaders;
    }

    /**
     * 
     */
    if (options.hasOwnProperty("responseHeaders") === true) {
        options.responseHeaders = toLowerCase(options.responseHeaders);
    } else {
        options.responseHeaders = simpleResponseHeaders;
    }

    /**
     * 
     */
    options.maxAge = options.maxAge || null;
    options.supportsCredentials = options.supportsCredentials || false;

    /**
     * 
     */
    if (options.hasOwnProperty("endPreflightRequests") === false) {
        options.endPreflightRequests = true;
    }


    /**
     * 
     */
    return function (req, res, next) {
        
        var methodMatches, headersMatch, requestMethod, requestHeaders, exposedHeaders, endPreflight;
        
        /**
         ** pengecekan parameter header yang di kirimkan oleh browser, 
         ** apabila menggunakan API platform seperti, Postman, insomnia
         */
        if (!req.headers.hasOwnProperty("origin")) {
            
            /**
             * * request langssung di bypass, 
             */
            next();


        } else {

            /**
             * * check original header
             */
            checkOriginMatch(req.headers.origin, options.origins, function (err, originMatches) {
                if (err !== null) {
                    next(err);
                } else {

                    var endPreflight = function () {
                        if (options.endPreflightRequests === true) {
                            res.writeHead(204);
                            res.end();
                        } else {
                            next();
                        }
                    };

                    /**
                     * * pengecekan origin, apakah origin dari browser sudah benar atau tidak
                     * * jika tidak maka akan langsung di return error
                     */
                    if (typeof originMatches !== "boolean" || originMatches === false) {
                        if (req.method === "OPTIONS") {
                            endPreflight();
                        } else {
                            next();
                        }
                    } else {


                        /**
                         * * jika origin sudah terdaftar maka lanjutkan ke pengecekan seterusnya
                         */
                        if (req.method === "OPTIONS") {
                            
                            /**
                             * * jika saat request tidak ada method, maka langsung di return error
                             */
                            if (!req.headers.hasOwnProperty("access-control-request-method")) {
                                endPreflight();
                            } else {

                                // get request method [POST, GET, OPTION, PUT]
                                requestMethod = req.headers["access-control-request-method"];

                                
                                // get content type [content-type, dll]
                                if (req.headers.hasOwnProperty("access-control-request-headers") && req.headers["access-control-request-headers"] !== "") {
                                    requestHeaders = toLowerCase(req.headers["access-control-request-headers"].split(/,\s*/));
                                } else {
                                    requestHeaders = [];
                                }
                                

                                //  pengecekan method yang di kirim oleh browser, jika method tidak ada didaftar maka langusng di return error
                                methodMatches = options.methods.indexOf(requestMethod) !== -1;
                                if (methodMatches === false) {
                                    endPreflight();
                                } else {


                                    // pengecekan request headers, jika request header tidak ada didaftar maka langusng di return error
                                    headersMatch = requestHeaders.every(function (requestHeader) {
                                            if (requestHeader === "origin") {
                                                return true;
                                            } else {
                                                if (options.requestHeaders.indexOf(requestHeader) !== -1) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            }
                                        });

                                        
                                    if (headersMatch === false) {
                                        endPreflight();
                                    } else {

                                        /**
                                         * 
                                         */
                                        if (options.supportsCredentials === true) {
                                            res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
                                            res.setHeader("Access-Control-Allow-Credentials", "true");
                                        } else {
                                            if (options.origins.length > 0 || typeof options.origins === "function") {
                                                res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
                                            } else {
                                                res.setHeader("Access-Control-Allow-Origin", "*");
                                            }
                                        }


                                        if (options.maxAge !== null) {
                                            res.setHeader("Access-Control-Max-Age", options.maxAge);
                                        }
                                        

                                        res.setHeader("Access-Control-Allow-Methods", options.methods.join(","));
                                        
                                        res.setHeader("Access-Control-Allow-Headers", options.requestHeaders.join(","));
                                        
                                        endPreflight();
                                    }
                                }
                            }
                        } else {
                            if (options.supportsCredentials === true) {
                                res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
                                res.setHeader("Access-Control-Allow-Credentials", "true");
                            } else {
                                if (options.origins.length > 0 || typeof options.origins === "function") {
                                    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
                                } else {
                                    res.setHeader("Access-Control-Allow-Origin", "*");
                                }
                            }

                            exposedHeaders = options.responseHeaders.filter(function (optionsResponseHeader) {
                                return simpleResponseHeaders.indexOf(optionsResponseHeader) === -1;
                            });

                            if (exposedHeaders.length > 0) {
                                res.setHeader("Access-Control-Expose-Headers", exposedHeaders.join(","));
                            }

                            next();
                        }
                    }
                }
            });
        }
    };
};
