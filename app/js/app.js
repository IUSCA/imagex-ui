/**
 * Created by youngmd on 8/11/17.
 */
var myapp = angular.module('myapp', [
    'app.config',
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    'toaster',
    'angular-loading-bar',
    'angularFileUpload',
    'angular-jwt',
    'ui.bootstrap',
    'ui.gravatar',
    'ui.select',
    'rzModule'
]);

myapp.factory('AuthService', function(appconf, $http, jwtHelper) {

    var user = JSON.parse(localStorage.getItem(appconf.user));
    var authToken = JSON.parse(localStorage.getItem(appconf.auth_token));

    return {
        user: function() { return JSON.parse(localStorage.getItem(appconf.user)); },
        token: function() { return JSON.parse(localStorage.getItem(appconf.auth_token)); },
        login: function(username, password, cb) {
            localStorage.removeItem(appconf.user);
            localStorage.removeItem(appconf.auth_token);
            $http({
                method: "POST",
                url: appconf.new_api+"/auth/login",
                data: {"username": username, "password": password}
            }).
            then(function(res) {
                console.log(res.data);
                authToken = res.data.jwt;
                var tokenPayload = jwtHelper.decodeToken(authToken);
                tokenPayload['created'] = new Date(tokenPayload.iat);
                tokenPayload['expiration'] = new Date(tokenPayload.exp);
                tokenPayload['id'] = authToken;
                localStorage.setItem(appconf.auth_token, JSON.stringify(tokenPayload));
                localStorage.setItem(appconf.user, JSON.stringify(res.data.profile));
                console.log(res.data.profile);
                console.log(JSON.parse(localStorage.getItem(appconf.user)));
                cb(true, null);
            }, function(err) {
                console.dir(err);
                cb(false, err.data);
            });
        },
        logout: function(cb) {
            $http({
                method: "GET",
                url: appconf.new_api+"/auth/logout"
            }).then(function(res) {
                localStorage.removeItem(appconf.user);
                localStorage.removeItem(appconf.auth_token);
                user = undefined;
                authToken = undefined;
                cb(true);
            }, function(err) {
                console.dir(err);
                cb(false);
            });
        },
        getRoles: function(cb) {
            var test_user = JSON.parse(localStorage.getItem(appconf.user));
            cb(test_user.roles);
        },
        isLoggedIn: function() { return (user.username != '');},
        checkToken: function() { return (authToken.id != '');}
    };
});

myapp.factory('TokenService', function($http){
    return {
        get: function(eid, cb) {
            $http({
                url: '/tokennew/'+eid
            }).then(function(res){
                cb(res.data);
            },
            function(err){
                console.dir(err);
                cb(null);
            })
        }
    }
});

myapp.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});

myapp.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
});

myapp.filter('limitObjectTo', function() {
    return function(obj, limit) {
        var newObj = {}, i = 0, p;
        for (p in obj) {
            newObj[p] = obj[p];
            if (++i === limit) break;
        }
        return newObj;
    };
});

myapp.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

//configure route
myapp.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider.
    when('/search', {
            templateUrl: 't/search.html',
            controller: 'SearchController',
            requiresLogin: true,
            nav: 'search'
        })
        .when('/activity', {
            templateUrl: 't/activity.html',
            controller: 'ActivityController',
            requiresLogin: true,
            requiresAdmin: true,
            nav: 'activity'
        })
        .when('/signin', {
            templateUrl: 't/signin.html',
            controller: 'SigninController',
            nav: 'signin'
        })
        .when('/upload', {
            templateUrl: 't/upload.html',
            controller: 'UploadController',
            requiresLogin: true,
            noGuest : true,
            nav: 'upload'
        })
        .when('/users', {
            templateUrl: 't/users.html',
            controller: 'UserController',
            requiresLogin: true,
            requiresAdmin: true,
            nav: 'users'
        })
        .when('/confirm/:id/:token', {
            templateUrl: 't/signin.html',
            controller: 'SigninController',
            nav: 'signin'
        })
        .when('/system', {
            templateUrl: 't/system.html',
            controller: 'SystemController',
            requiresLogin: true,
            requiresAdmin: true,
            nav: 'system'
        })
        .when('/configure', {
            templateUrl: 't/configure.html',
            controller: 'ConfigureController',
            requiresLogin: true,
            requiresAdmin: true,
            nav: 'configure'
        })
        .when('/demo', {
            templateUrl: 't/demo.html',
            controller: 'DemoController',
            requiresLogin: true,
            nav: 'demo'
        })
        .otherwise({
            redirectTo: '/signin'
        });
}]).run(['$rootScope', '$location', '$http', 'toaster', 'jwtHelper', 'appconf', 'AuthService', function($rootScope, $location, $http, toaster, jwtHelper, appconf, AuthService) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //redirect to /signin if user hasn't authenticated yet
        $rootScope.activeNav = next.nav;
        $rootScope.user = AuthService.user();
        if(next.requiresLogin) {
            var authToken = AuthService.token();
            var today = new Date();
            if(authToken == null || (authToken.expiration > today )) {
                toaster.warning("Please sign in first");
                sessionStorage.setItem('auth_redirect', next.originalPath);
                $location.path("/signin");
                event.preventDefault();
                return;
            }

            var user = AuthService.user();
            if(next.requiresAdmin) {
                if(user.roles == undefined || user.roles.indexOf('admin') == -1) {
                    toaster.warning("You are not authorized to access that location");
                    event.preventDefault();
                }
            }

            if(next.noGuest) {
                if(user.roles.indexOf('guest') != -1) {
                    toaster.warning("You must register first to access this feature");
                    event.preventDefault();
                }
            }
        }
    });

    $rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
        //get most recent config from db and update appconf
        console.log('in here!');
        $http({
            method: "GET",
            url: appconf.new_api+"/configs"
        }).then(function(res) {
            console.log(res.data);
            $rootScope.site_config = res.data.config;
        }, function(err) {
            console.dir(err);
        });
    })
}]);

