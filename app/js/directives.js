myapp.directive('passwordStrength', function() {
    return {
        scope: {
            password: "=password",

            //optional attributes to make password more secure
            profile: "=profile",
            user: "=user",
        },
        templateUrl: 't/passwordstrength.html',
        link: function(scope, element, attributes) {
            scope.password_strength = {};
            scope.$watch('password', function(newv, oldv) {
                if(newv) {
                    //gather strings that we don't want user to use as password (like user's own fullname, etc..)
                    var used = [];
                    if(scope.profile) used.push(scope.profile.fullname);
                    if(scope.user) {
                        used.push(scope.user);
                    }

                    console.log(used);
                    //https://blogs.dropbox.com/tech/2012/04/zxcvbn-realistic-password-strength-estimation/
                    var st = zxcvbn(newv, used);
                    scope.password_strength = st;
                }
            });
        }
    };
});

myapp.directive('imagexviewer', function() {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            ixid: '@',
            imageids: '=imageids',
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
            console.log($scope.user);
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

myapp.directive('searchElement', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            field: '=field'
        },
        link: function(scope) {
            scope.opened = false;
            scope.today = function() {
                return new Date();
            };
            scope.maxdate = scope.today();
            scope.format = 'yyyy-MM-dd';

            scope.dateopen = function($event, field, open) {
                $event.preventDefault();
                $event.stopPropagation();

                field[open] = true;
            };
        },
        templateUrl: 't/searchfields.html'
    };
});

myapp.directive('raDecFields', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            form: '=form'
        },
        link: function($scope, $sce) {
            $scope.coordSystems = [
                {'system':'equ','label':'Equatorial','ralabel':'ra','raunit':'&alpha;','declabel':'dec','decunit':'&delta;','epochs':true},
                {'system':'gal','label':'Galactic','ralabel':'lon','raunit':'l','declabel':'lat','decunit':'b','epochs':false},
                {'system':'ecl','label':'Ecliptic','ralabel':'lon','raunit':'&lambda;','declabel':'lat','decunit':'&beta;','epochs':true}
            ];

            $scope.epochs = [
                {'id':'J2000','name':'J2000'},
                {'id':'B1950','name':'B1950'}
            ];

            $scope.coordDisplays = [
                {'id':'sex','name':'Sexigesimal'},
                {'id':'dec','name':'Decimal'}
            ];

            $scope.epoch = $scope.epochs[0];
            $scope.coordSystem = angular.copy($scope.coordSystems[0]);
            $scope.coordDisplay = angular.copy($scope.coordDisplays[1]);

            $scope.change_system = function() {
                angular.forEach($scope.coordSystems, function(value, key) {
                    if($scope.coordSystem.system == value.system){
                        $scope.coordSystem = angular.copy(value);
                        $scope.update_system();
                        return;
                    }
                });
            };

            $scope.change_epoch = function() {
                console.log($scope.epoch);
                $scope.update_system();
            }

            $scope.change_display = function() {
                $scope.formatRA('ra');
                $scope.formatDEC('dec');
            }


            $scope.update_system = function() {
                var transform_type = '';
                switch($scope.coordSystem.system) {
                    case 'gal':
                        transform_type = 'JtoG';
                        break;
                    case 'equ':
                        if($scope.epoch.id == 'J2000'){
                            $scope.posd.ra = $scope.form.coords.ra;
                            $scope.posd.dec = $scope.form.coords.dec;
                            $scope.formatRA('ra');
                            $scope.formatDEC('dec');
                            return;
                        } else {
                            transform_type = 'JtoB';
                            break;
                        }
                    case 'ecl':
                        if($scope.epoch.id == 'J2000'){
                            transform_type = 'JtoEclJ';
                            break;
                        } else {
                            transform_type = 'JtoEclB';
                            break;
                        }
                }
                console.log([$scope.form.coords.ra,$scope.form.coords.dec]);
                var new_coords = $scope.Transform([$scope.form.coords.ra,$scope.form.coords.dec], $scope[transform_type]);
                console.log(new_coords);
                $scope.posd.ra = new_coords[0];
                $scope.posd.dec = new_coords[1];
                $scope.formatRA('ra');
                $scope.formatDEC('dec');
            }

            $scope.update_coords = function() {
                var transform_type = '';
                switch($scope.coordSystem.system) {
                    case 'gal':
                        transform_type = 'GtoJ';
                        break;
                    case 'equ':
                        if($scope.epoch.id == 'J2000'){
                            $scope.form.coords.ra = $scope.ParseRa($scope.posd['ra'].toString());
                            $scope.form.coords.dec = $scope.ParseDec($scope.posd['dec'].toString());
                            $scope.formatRA('ra');
                            $scope.formatDEC('dec');
                            return;
                        } else {
                            transform_type = 'BtoJ';
                            break;
                        }
                    case 'ecl':
                        if($scope.epoch.id == 'J2000'){
                            transform_type = 'EclJtoJ';
                            break;
                        } else {
                            transform_type = 'EclBtoJ';
                            break;
                        }
                }
                var ra = ParseRa($scope.posd['ra'].toString());
                var dec = ParseDec($scope.posd['dec'].toString());
                var new_coords = $scope.Transform([ra,dec], $scope[transform_type]);
                $scope.form.coords.ra = new_coords[0];
                $scope.form.coords.dec = new_coords[1];
                $scope.formatRA('ra');
                $scope.formatDEC('dec');
            };

            $scope.formatRA = function(field) {
                tmp = $scope.posd[field];
                console.log(tmp);
                var ra_decimal = '';
                if($scope.coordSystem.system == 'equ'){
                    ra_decimal = $scope.ParseRa(tmp.toString());
                } else {
                    $scope.formatDEC(field);
                    return;
                }
                console.log(ra_decimal);
                if($scope.coordDisplay.id == 'sex'){
                    tmp = $scope.ra_d2hms(ra_decimal);
                } else {
                    tmp = ra_decimal.toFixed(4);
                }
                console.log(tmp);
                $scope.posd[field] = tmp;
            };

            $scope.formatDEC = function(field) {
                console.log(field);
                tmp = $scope.posd[field];
                console.log(tmp);
                var dec_decimal = $scope.ParseDec(tmp.toString());
                console.log(dec_decimal);
                if($scope.coordDisplay.id == 'sex'){
                    tmp = $scope.dec_d2dms(dec_decimal);
                } else {
                    tmp = dec_decimal.toFixed(4);
                }
                $scope.posd[field] = tmp;
            };

            $scope.form.coords = {
                'ra':'',
                'dec':'',
                'radius':'',
                'radius_unit':'degree',
            };

            $scope.posd = {
                'ra':'',
                'dec':''
            };

            $scope.postype = 'cone';

            //many functions here borrowed from:
            // http://www.robertmartinayers.org/tools/coordinates.html
            // excellent astronomical javascript coordinate calculator

            $scope.Math = window.Math;

            $scope.Numberish = function(char3) {
                if ( char3 == "0" ) return 1;
                if ( char3 == "1" ) return 1;
                if ( char3 == "2" ) return 1;
                if ( char3 == "3" ) return 1;
                if ( char3 == "4" ) return 1;
                if ( char3 == "5" ) return 1;
                if ( char3 == "6" ) return 1;
                if ( char3 == "7" ) return 1;
                if ( char3 == "8" ) return 1;
                if ( char3 == "9" ) return 1;
                if ( char3 == "." ) return 1;
                if ( char3 == "-" ) return 1;
                return 0;
            }

            $scope.ParseRa = function(val) {
                var negative = 0

                if (val === ""){
                    return "";
                }

                var answer = 0;  var val2 = 0; var times = 15.0 * 3600.0;

                // Skip initial blanks
                while ( (val.length > 0) && (val.indexOf(" ") == 0) )
                { val = val.substring(1); }

                if ( (val.length > 0) && (val.indexOf("-") == 0) )
                { negative = 1; val = val.substring(1); }

                // Don't blame me for the ECMAScript String class ...

                //run through the whole string looking for non numbers (" ", ":", "h", etc.)
                for (i = 0; i < val.length; i++) {
                    if( ! $scope.Numberish(val.charAt(i))){ times = 15.0 * 3600; break; }
                    else { times = 3600; }
                }

                // Special form: initial "+" => degrees, not hours
                if ( (val.length > 0) && (val.indexOf("+") == 0) )
                { times = 3600.0; val = val.substring(1); }

                // Special form: degree sign
                if ( val.indexOf("?") != -1 ) { times = 3600.0; }

                while ( val.length > 0 ) // Big loop pulling numbers
                {
                    if ( ! $scope.Numberish(val.charAt(0)) )
                    { val = val.substring(1); continue; }
                    // val[0] is numberish
                    var coun = 0;
                    while ( (coun < val.length) && $scope.Numberish(val.charAt(coun)) ) { coun = coun + 1; }
                    // Have a number in [0..coun)

                    val2 = val.substring(0,coun);
                    val = val.substring (coun);
                    // Have the number in val2 and the rest of the string in val.

                    answer = parseFloat (answer) + parseFloat (val2) * times;
                    times = times / 60;
                } // big loop pulling numbers

                answer = answer / 3600.
                if ( negative ) answer = 360.0 - answer;
                return answer;
            }

            // parseFloat and eval seem to work.  ToNumber fails.

            $scope.ParseDec = function(val)
            {
                if (val === ""){
                    return "";
                }

                var negative = 0;
                var answer = 0;  var val2 = 0; var times = 3600.0;

                // Skip initial blanks
                while ( (val.length > 0) && (val.indexOf(" ") == 0) )
                { val = val.substring(1); }

                if ( (val.length > 0) && (val.indexOf("-") == 0) )
                { negative = 1; val = val.substring(1); }

                console.log(val);
                console.log("val length is "+val.length);
                // Don't blame me for the ECMAScript String class ...

                while ( val.length > 0 ) // Big loop pulling numbers
                {
                    console.log(val);
                    if ( ! $scope.Numberish(val.charAt(0)) )
                    { val = val.substring(1); continue; }
                    // val[0] is numberish
                    var coun = 0;
                    while ( (coun < val.length) && $scope.Numberish(val.charAt(coun)) ) { coun = coun + 1; }
                    // Have a number in [0..coun)

                    val2 = val.substring(0,coun);
                    val = val.substring (coun);
                    // Have the number in val2 and the rest of the string in val.
                    console.log([val,val2]);
                    answer = parseFloat(answer) + parseFloat(val2) * times;
                    times = times / 60;
                } // big loop pulling numbers

                if ( negative ) answer = 0.0 - answer;
                console.log(answer);
                return (answer / 3600.);
            }

            $scope.pad = function (number, length) {

                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                }

                return str;

            }

            $scope.ra_d2hms = function(val_in)
            {
                val = parseFloat(val_in);
                console.log(val);
                var hh = val / 15.0 + (0.5 / 3600);
                var h = $scope.Math.floor(hh);
                hh = hh - h;
                hh = hh * 60;
                var m = $scope.Math.floor(hh);
                hh = hh - m;
                hh = hh * 60;
                var s = $scope.Math.floor(hh);
                console.log(h);
                console.log($scope.pad(h,2) + ":" + $scope.pad(m,2) + ":" + $scope.pad(s,2));
                //return ("blahblahblah");
                return ($scope.pad(h,2) + ":" + $scope.pad(m,2) + ":" + $scope.pad(s,2));
            }

            $scope.dec_d2dms = function(val_in)
            {
                val = parseFloat(val_in);
                var dec_tmp = val;
                var sign2 = "";
                if ( dec_tmp < 0.0 ) { sign2 = "-";  dec_tmp = 0.0 - dec_tmp; }

                var hh = dec_tmp + (0.5 / 3600);
                var h = $scope.Math.floor(hh);
                hh = hh - h;
                hh = hh * 60;
                var m = $scope.Math.floor(hh);
                hh = hh - m;
                hh = hh * 60;
                var s = $scope.Math.floor(hh);

                return (sign2 + $scope.pad(h,2) + ":" + $scope.pad(m,2) + ":" + $scope.pad(s,2));
            }

            $scope.pi = 3.1415926535
            $scope.toDegrees = 180.0/$scope.pi;

            $scope.BtoJ = new Array (
                0.9999256782, -0.0111820611, -0.0048579477,
                0.0111820610,  0.9999374784, -0.0000271765,
                0.0048579479, -0.0000271474,  0.9999881997 );

            $scope.JtoB = new Array (
                0.9999256795,  0.0111814828,  0.0048590039,
                -0.0111814828,  0.9999374849, -0.0000271771,
                -0.0048590040, -0.0000271557,  0.9999881946 );

            $scope.JtoG = new Array (
                -0.054876, -0.873437, -0.483835,
                0.494109, -0.444830,  0.746982,
                -0.867666, -0.198076,  0.455984 );

            $scope.JtoGapj = new Array (
                -0.054875529,  0.494109454, -0.867666136,
                -0.873437105, -0.444829594, -0.198076390,
                -0.483834992,  0.746982249,  0.455983795 );

            $scope.GtoJ = new Array (
                -0.0548755604,  0.4941094279, -0.8676661490,
                -0.8734370902, -0.4448296300, -0.1980763734,
                -0.4838350155,  0.7469822445,  0.4559837762 );

            $scope.Transform = function( radec, matrix ) // returns a radec array of two elements
            {
                radec[0] = $scope.deg2rad(radec[0]);
                radec[1] = $scope.deg2rad(radec[1]);
                var r0 = new Array (
                    $scope.Math.cos(radec[0]) * $scope.Math.cos(radec[1]),
                    $scope.Math.sin(radec[0]) * $scope.Math.cos(radec[1]),
                    $scope.Math.sin(radec[1]) );

                var s0 = new Array (
                    r0[0]*matrix[0] + r0[1]*matrix[1] + r0[2]*matrix[2],
                    r0[0]*matrix[3] + r0[1]*matrix[4] + r0[2]*matrix[5],
                    r0[0]*matrix[6] + r0[1]*matrix[7] + r0[2]*matrix[8] );

                var r = $scope.Math.sqrt ( s0[0]*s0[0] + s0[1]*s0[1] + s0[2]*s0[2] );

                var result = new Array ( 0.0, 0.0 );
                result[1] = $scope.Math.asin ( s0[2]/r ); // New dec in range -90.0 -- +90.0

                var cosaa = ( (s0[0]/r) / $scope.Math.cos(result[1] ) );
                var sinaa = ( (s0[1]/r) / $scope.Math.cos(result[1] ) );
                result[0] = $scope.Math.atan2 (sinaa,cosaa);
                if ( result[0] < 0.0 ) result[0] = result[0] + pi + pi;

                result[0] = $scope.rad2deg(result[0]);
                result[1] = $scope.rad2deg(result[1]);

                return result;
            }

            //http://www.neoprogrammics.com/obliquity_of_the_ecliptic/
            //obliquity of the ecliptic B1950 = 23.4481495930
            //obliquity of the ecliptic J2000 = 23.4377627594

            //cos(b1950obl) = 0.9174205509065
            //sin(b1950obl) = 0.397919002781
            //cos(j2000obl) = 0.9174926723567
            //sin(j2000obl) = 0.397752682168

            $scope.JtoEclJ = new Array (
                1, 0, 0,
                0, 0.9174926723567, 0.397752682168,
                0, -0.397752682168,  0.9174926723567);

            $scope.JtoEclB = new Array (
                1, 0, 0,
                0, 0.9174205509065, 0.397919002781,
                0, -0.397919002781,  0.9174205509065);

            $scope.EclBtoJ = new Array (
                1, 0, 0,
                0, 0.9174205509065, -0.397919002781,
                0, 0.397919002781,  0.9174205509065);

            $scope.EclJtoJ = new Array (
                1, 0, 0,
                0, 0.9174926723567, -0.397752682168,
                0, 0.397752682168,  0.9174926723567);

            $scope.deg2rad = function(degrees) {
                var pi = 3.141592635;
                var deg = parseFloat(degrees);
                return deg * (pi/180.0);
            }

            $scope.rad2deg = function(radians) {
                var pi = 3.141592635;
                var rad = parseFloat(radians);
                return rad * (180.0 / pi);
            }
        },
        templateUrl: 't/radecfields.html'
    };
});