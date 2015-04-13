var services = angular.module('services.request', ['ionic']);

services.factory('RequestService', function (AccountsService, AlertService, $q, $window, $http) {

    var service = {

        request: function (method, url, pro, data) {

            var deferred = $q.defer();

                var domain, host;
                if (pro == "false" || pro === false) {
                    console.log("REQUEST: IS NOT PRO");
                    domain = "https://api.travis-ci.org";
                    host = "api.travis-ci.org";
                } else if (pro == "true" || pro === true) {
                    domain = "https://api.travis-ci.com";
                    host = "api.travis-ci.com";
                    console.log("REQUEST: IS PRO");
                } else {
                    AlertService.raiseAlert("Oops! Something went wrong and we couldn't make your request. Please try again.");
                }

                var headers = {
                    'Accept': 'application/vnd.travis-ci.2+json',
                    'User-Agent': 'Trevor/1.5.3',
                    'Host': host,
                    // 'Content-Type': 'application/json',
                    // 'Content-Length': 37
                };

                if ((pro == "true" || pro === true) && url != "/auth/github") {
                    var token = AccountsService.tokens.pro;
                    headers.Authorization = "token " + token;
                }

                if (pro == "false" || pro === false && url == "/accounts?all=true") {
                    var token = AccountsService.tokens.os;
                    headers.Authorization = "token " + token;
                }

                if (url.indexOf("logs") > -1) {
                    headers.Accept = "text/plain";
                }

                $http({
                    url: domain + url,
                    method: method,
                    headers: headers,
                    data : data })
                    .success(function (data) {
                        // Success
                        deferred.resolve(data);
                    }).error(function (data){
                        // Failure
                        deferred.reject(data);
                    });


            return deferred.promise;

        }

    };

    return service;

});