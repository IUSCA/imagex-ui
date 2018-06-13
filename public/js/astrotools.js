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
    console.log(pad(h,2) + ":" + pad(m,2) + ":" + pad(s,2));
    //return ("blahblahblah");
    return (pad(h,2) + ":" + pad(m,2) + ":" + pad(s,2));
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

    return (sign2 + pad(h,2) + ":" + pad(m,2) + ":" + pad(s,2));
}

$scope.pi = 3.1415926535
$scope.toDegrees = 180.0/pi;

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
    radec[0] = deg2rad(radec[0]);
    radec[1] = deg2rad(radec[1]);
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

    result[0] = rad2deg(result[0]);
    result[1] = rad2deg(result[1]);

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
