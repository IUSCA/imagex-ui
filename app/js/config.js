'use strict';

//this is checked in to git as default
//nothing sensitive should go here (since it will be published via web server anyway)
//contrib

angular.module('app.config', [])
.constant('appconf', {

    title: 'ImageX UI',

    jwt_id: 'jwt',

    default_redirect_url: '/signin',  //don't start with #
    auth_redirect_url: '/demo', //for signed-in users
    auth_token: 'auth_token',
    user: 'ix_user',

    api_url: '/imagex-api/api',

    tile_load_limit: 140
    });


