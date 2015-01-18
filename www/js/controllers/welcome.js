var app = angular.module('controller.welcome', ['ionic']);

app.controller('WelcomeCtrl', function($scope, $state, $window, $http, LoadingService, AccountsService) {

    var options = {
        client_id: 'a6adc03baaa25c30292c',
        client_secret: '49c6d6012de3988db2364b49e161f8fe3052e920',
        redirect_uri: 'http://btnlab.uk/callback.html',
        scope: [
            "user:email", "read:org", "repo_deployment",
            "repo:status", "write:repo_hook"
        ]
    };

    $scope.login = function() {

        LoadingService.show();

        //Build the OAuth consent page URL
        var githubUrl = 'https://github.com/login/oauth/authorize?';
        var authUrl = githubUrl + 'client_id=' + options.client_id + '&redirect_uri=' + options.redirect_uri + '&scope=' + options.scope;
        var authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=yes,toolbarposition=top,clearcache=yes');

        authWindow.addEventListener('loadstart', function(e) {
            var url = (typeof e.url !== 'undefined' ? e.url : e.originalEvent.url),
                raw_code = /code=([^&]*)/.exec(e.url) || null,
                code = (raw_code && raw_code.length > 1) ? raw_code[1] : null,
                error = /\?error=(.+)$/.exec(e.url);

            if (code || error) {
                // Close the browser if code found or error
                authWindow.close();
            }

            // If there is a code, proceed to get token from github
            if (code) {
                requestToken(code);
            } else if (error) {
                LoadingService.hide();
            }

        });

        // If "Done" button is pressed, hide "Loading"
        authWindow.addEventListener('exit', function(e) {
            console.log("Github InAppBrowser Window Closed");
            LoadingService.hide();
        }, false);

    };


    function requestToken(code) {
        $http.post('https://github.com/login/oauth/access_token',{
                client_id: options.client_id,
                client_secret: options.client_secret,
                code: code,
            }).
            success(function(data, status, headers, config) {

                // If access token received, authenticate with Travis
                $window.localStorage.githubtoken = data.split("&")[0].split("=")[1];
                console.log("Github Token: " + $window.localStorage.githubtoken);
                authTravis();

            }).
            error(function(data, status, headers, config) {

                alert("Failure.");
                console.log(data);
                LoadingService.hide();

            });
    }

    function authTravis() {
        var token = $window.localStorage.githubtoken;

        $http({
            url: 'https://api.travis-ci.org/auth/github',
            method: "POST",
            data: {github_token: token},
            headers: {
                // 'User-Agent': 'MyClient/1.0.0',
                'Accept': 'application/vnd.travis-ci.2+json',
                // 'Host': 'api.travis-ci.org',
                // 'Content-Type': 'application/json',
                // 'Content-Length': 37
              }
          }).success(function (data, status, headers, config) {

            console.log("Success!");
            $window.localStorage.travistoken = data.access_token;
            $state.go('app.accounts');
            LoadingService.hide();

          }).error(function (data, status, headers, config) {

            alert("Failure." + data);
            console.log(data);
            LoadingService.hide();

          });
    }


});