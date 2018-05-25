fis.config.set('pack', {
    'js/libs/schoolmeals-mini.js': [
        'js/libs/jquery.js',
        'js/libs/bootstrap.js',
        'js/libs/avalon.js',
        'js/libs/store.min.js',
        'js/core/jx.js'       
    ],
    'css/schollmeals-mini.css': [
        'css/common.css',
        'css/jx.css'             
    ]

});


fis.match('::package', {
    postpackager: fis.plugin('loader', {
        allInOne: true
    })
});

fis.match('*.css', {
    optimizer: fis.plugin('clean-css'),
    url: '../..$0'
});




fis.match('*.js', {
    optimizer: fis.plugin('uglify-js'),
    url: '../..$0'
});
/*

fis.match('*.{png,jpg,gif}', {
    url: 'schoolmeals$0'
});
*/


fis.match('*.js', {
    useHash: true
});
fis.match('css/*.css', {
    useHash: true
});