({
    appDir: './src',
    baseUrl: './js',
    dir: './dist',
    modules: [
        {
            name: 'config/teacher_index'
           
        },
         {
            name: 'config/teacher_list'
        }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimize:'none',
    optimizeCss: 'standard',
    removeCombined: true,
    paths: {
        jquery: 'libs/jquery',
        avalon:'libs/avalon',
        template:'libs/template'
    }
})