requirejs.config({
    baseUrl: '../../js/libs',
    paths: {
        app: '../app'
    }
});
requirejs(['app/teacher/list'], function (list) {
    
});
