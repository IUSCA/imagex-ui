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

myapp.factory('AuthService', function(appconf, $http) {

    var user = JSON.parse(localStorage.getItem(appconf.user));
    var authToken = JSON.parse(localStorage.getItem(appconf.auth_token));

    return {
        user: function() { return user; },
        token: function() { return authToken},
        login: function(username, password, cb) {
            localStorage.removeItem(appconf.user);
            localStorage.removeItem(appconf.auth_token);
            $http({
                method: "POST",
                url: appconf.api_url+"/users/login",
                data: {"email": username, "password": password}
            }).
            then(function(res) {
                authToken = res.data;
                authToken.created = new Date(authToken.created);
                authToken['expiration'] = authToken.created + authToken.ttl;
                $http({
                    method: "GET",
                    url: appconf.api_url+"/users/"+authToken.userId+"?access_token="+authToken.id
                }).then(function(res) {
                    user = res.data;
                    localStorage.setItem(appconf.auth_token, JSON.stringify(authToken));
                    localStorage.setItem(appconf.user, JSON.stringify(user));
                    cb(true);
                }, function(err) {
                    console.dir(err);
                    cb(false);
                });
            }, function(err) {
                console.dir(err);
                cb(false);
            });
        },
        logout: function(cb) {
            $http({
                method: "POST",
                url: appconf.api_url+"/users/logout?access_token="+authToken.id
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
            $http({
                method: "GET",
                url: appconf.api_url+"/users/"+user.id+"/getRolesById?&access_token="+authToken.id
            }).then(function(res) {
                var roles = res.data.payload.roles;
                user["roles"] = roles;
                localStorage.setItem(appconf.user, JSON.stringify(user));
                cb(roles);
            }, function(err) {
                console.dir(err);
                cb(false);
            });
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


myapp.directive('imagexviewer', function() {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            ixid: '@',
            imageids: '@',
            ixheight: '@',
            arrangement: '@',
            onload: '&onload'
        },
        templateUrl: "t/imagex.html",
        controller: 'ImagexController'
    };
});

myapp.directive('navbar', function() {
    return {
        restrict: "E",
        replace: true,
        templateUrl: 't/navbar.html',
        controller: ['$scope', '$rootScope', '$location','appconf', 'AuthService', 'toaster', function ($scope, $rootScope, $location, appconf, AuthService, toaster) {
            $scope.user = AuthService.user();
            $scope.title = appconf.title;
            $scope.active = $rootScope.activeNav;
            $scope.logout = function() {
                AuthService.logout(function(res){
                    console.dir(res);
                    if(res){
                        $location.path("/signin");
                        toaster.pop('success', 'Logged Out', "Successfully logged out");
                    }
                });
            }
        }]
    };
});

myapp.directive("colormap", function() {
    return {
        restrict: "A",
        scope: {
            cmap: '=cmap',
            width: '@',
            height: '@',
            label: '@'
        },
        link: function (scope, element, attrs) {

            var tmp_cmap = scope.cmap.slice(0);
            var center = 128;
            var diff = 255 - center;
            for(i = 0; i < 256; i++) {
                if(i > center){
                    var offset = i - center;
                    var ratio = offset / diff;
                    var position = Math.min(ratio * 128 + 128,255)|0;
                }else{
                    var ratio = center / 128;
                    var position = Math.max(0,i/ratio,0)|0;
                }
                tmp_cmap[i] = scope.cmap[position];
            }

            var width = scope.width;
            var height = scope.height;
            var canvas = document.createElement('canvas');
            var label = document.createTextNode(scope.label);

            var ctx = canvas.getContext('2d');
            canvas.id = 'canvas';
            canvas.width = width;
            canvas.height = height;

            element[0].appendChild(canvas);
            element[0].appendChild(label);

            var step = canvas.width / 256;
            var distance = 0;


            for(var i = 0; i < 256; i++){
                var value = tmp_cmap[i];
                ctx.strokeStyle = "rgb("+value[0]+","+value[1]+","+value[2]+")";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(distance,0);
                ctx.lineTo(distance,canvas.height);
                ctx.stroke();
                distance = distance + step;
            }

        }
    };
});

myapp.directive('modalDialog', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function(scope) {
            scope.cancel = function() {
                scope.$dismiss('cancel');
            };
        },
        template:
        "<div>" +
        "<div class='modal-header'>" +
        "<button type='button' class='close' data-dismiss='cancel' ng-click='cancel()' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
        "<h3 class='modal-title' ng-bind='dialogTitle'></h3>" +
        "</div>" +
        "<div class='modal-body' ng-transclude></div>" +
        "</div"
    };
});


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
        .when('/demo', {
            templateUrl: 't/demo.html',
            controller: 'DemoController',
            requiresLogin: true,
            nav: 'demo'
        })
        .otherwise({
            redirectTo: '/signin'
        });
}]).run(['$rootScope', '$location', 'toaster', 'jwtHelper', 'appconf', 'AuthService', function($rootScope, $location, toaster, jwtHelper, appconf, AuthService) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //redirect to /signin if user hasn't authenticated yet
        $rootScope.activeNav = next.nav;
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
}]);

