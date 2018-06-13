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
    new_api: '/imagex-newapi',

    tile_load_limit: 140,

    default_site_options: {
        _guest: {
            _enabled: false,
            _search: true,
            _download: false
        },
        _registration: 'open',  // open|invite
        _users: {
            _upload: true,
            _delete: false,
            _sharing: 'all',  //  choose|none|all
            _quota: 1e10   // default upload limit in bytes
        },
        _demomode: true,
        _maxfilesize: 1e9 // maximum file size for individual upload in bytes
    }
});


