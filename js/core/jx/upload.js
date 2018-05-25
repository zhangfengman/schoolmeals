J.$package(function(J) {

    var UploadProgress = new J.Class({
        init: function(file, targetID) {
            this.file = file;
            this.targetID = targetID;
            var domStr = this.addFile(this.file);
            $("#" + this.targetID).append(domStr);
        },
        addFile: function(file) {
            var dom = '<div class="crow" id="' + file.id + '">' +
                '<div class="ccol ccol-4">' + file.name + '</div>' +
                '<div class="ccol ccol-5 upload_progress_c" >' +
                '<div class="upload_progress">' +
                '<div class="progress"></div>' +
                '</div>' +
                '</div>' +
                '<div class="ccol ccol-1 upload_progress_del">X</div>' +
                '</div>';
            return dom;
        },
        bindEvent: function(up) {
            var self = this;
            if (up) {
                $("#" + this.targetID).on("click", ".upload_progress_del", function() {
                    $(this).parents(".crow").remove();
                    up.removeFile(self.file);
                });
            }
        },
        setProgress: function(file) {

            $("#" + file.id + " .progress").css("width", file.percent + "%");
        },
        setComplete: function(txt) {
            $("#" + this.file.id + " .upload_progress_c").html(txt);
            $("#" + this.file.id + " .upload_progress_del").hide();
        }

    });
    J.UploadProgress = J.UploadProgress || {};
    J.UploadProgress = UploadProgress;
});



/**

**/
J.$package(function(J) {

    var Upload = new J.Class({
        init: function(args) {
            this.browseButton = args.browseButton;
            this.container = args.container;
            this.token = "";
            this.domain = "";
            this.isShow = false;
            this.files = [];
            this.targetID = "uploadfileList"
            this.complete = args.complete || function() {};
            this.before = args.before || function() {return true};
            this.progressList = [];
            var self = this;

            this.getToken(function(data) {
                self.token = data.token;
                self.domain = data.domain; //"http://oijh7oxw6.bkt.clouddn.com";
                self.createUpload();

            });

        },

        showLayer: function() {
            var self = this;
            layer.open({
                shade: 0,
                type: 1,
                title: "上传",
                area: ['400px', '250px'],
                content: '<div class="ctable" id="uploadfileList"></div>',
                offset: 'rb',
                end: function() {
                    self.isShow = false;
                }
            });

        },
        getToken: function(callback) {
            J.ajax({
                url: "/storage/getToken",
                type: 'POST'
            }, null, function(data) {
                callback(data);
            });
        },

        suffix: function(file_name) {
            var result = /\.[^\.]+/.exec(file_name);
            return result;
        },
        getProgress: function(file) {
            var obj = null;
            for (var k = 0; k < this.progressList.length; k++) {
                if (this.progressList[k].file.id === file.id) {
                    obj = this.progressList[k];
                    break;
                }
            }
            return obj;
        },
        createUpload: function() {
            var self = this;
            var browse_button = this.browseButton;
            var token = this.token;
            var domain = this.domain;
            var container = this.container;
            var uploader = Qiniu.uploader({
                runtimes: 'html5,flash,html4', // 上传模式，依次退化
                browse_button: browse_button, // 上传选择的点选按钮，必需
                // 在初始化时，uptoken，uptoken_url，uptoken_func三个参数中必须有一个被设置
                // 切如果提供了多个，其优先级为uptoken > uptoken_url > uptoken_func
                // 其中uptoken是直接提供上传凭证，uptoken_url是提供了获取上传凭证的地址，如果需要定制获取uptoken的过程则可以设置uptoken_func
                uptoken: token,
                //uptoken : 'mCHQpwCQ6_4vpERRS6vCwZVgkmDbzuntNuZ_JsjH:7cvRhMv4epQJd04HTLL31Xt5RsU=:eyJzY29wZSI6InRlc3QiLCJkZWFkbGluZSI6MTQ4MjYzODI3NH0=', // uptoken是上传凭证，由其他程序生成
                // uptoken_url: '/uptoken',         // Ajax请求uptoken的Url，强烈建议设置（服务端提供）
                // uptoken_func: function(file){    // 在需要获取uptoken时，该方法会被调用
                //    // do something
                //    return uptoken;
                // },
                get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的uptoken
                // downtoken_url: '/downtoken',
                // Ajax请求downToken的Url，私有空间时使用，JS-SDK将向该地址POST文件的key和domain，服务端返回的JSON必须包含url字段，url值为该文件的下载地址
                // unique_names: true,              // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
                // save_key: true,                  // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
                domain: domain, // bucket域名，下载资源时用到，必需
                container: container, // 上传区域DOM ID，默认是browser_button的父元素
                max_file_size: '100mb', // 最大文件体积限制
                flash_swf_url: 'path/of/plupload/Moxie.swf', //引入flash，相对路径
                max_retries: 3, // 上传失败最大重试次数
                dragdrop: true, // 开启可拖曳上传
                drop_element: container, // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
                chunk_size: '4mb', // 分块上传时，每块的体积
                auto_start: true,
                init: {
                    'FilesAdded': function(up, files) {
                        if(!self.before()){
                            return;
                        }

                        if (!self.isShow) {
                            self.isShow = true;
                            self.showLayer();
                        }
                        plupload.each(files, function(file) {
                            //var dom = self.addFile(file);
                            //$("#uploadfileList").append(dom);
                            var progress = new J.UploadProgress(file, self.targetID);
                            progress.bindEvent(up);
                            self.progressList.push(progress);
                        });
                    },
                    'BeforeUpload': function(up, file) {

                        //每个文件上传前，处理相关的事情
                        //return self.before();
                        //return false;
                    },
                    'UploadProgress': function(up, file) {

                        // 每个文件上传时，处理相关的事情
                        var progress = self.getProgress(file);
                        progress.setProgress(file);
                    },
                    'FileUploaded': function(up, file, info) {

                        var progress = self.getProgress(file);
                        progress.setComplete("完成");
                        
                        var domain = up.getOption('domain');
                        var res = JSON.parse(info);
                        var sourceLink = domain + "/" + res.key; //获取上传成功后的文件的Url
                        //console.log(sourceLink);     

                        for (var i = 0; i < self.files.length; i++) {
                            if (self.files[i].name === res.key) {
                                self.files[i].path = sourceLink;
                            }
                        }
                    },
                    'Error': function(up, err, errTip) {
                        //上传出错时，处理相关的事情
                    },
                    'UploadComplete': function(up, file, info) {
                       
                        setTimeout(function(){
                            self.complete(self.files);
                            self.files = [];
                            //队列文件处理完毕后，处理相关的事情
                        },500);
                        
                    },
                    'Key': function(up, file) {
                        // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                        // 该配置必须要在unique_names: false，save_key: false时才生效
                        var key = new Date().getTime() + "_" + file.name;
                        self.files.push({ ext: self.suffix(file.name)[0].replace(".", ""), name: key, size: file.size, path: "" });
                        // do something with key here
                        return key
                    }
                }
            });
        }


    })

    J.Upload = J.Upload || {};
    J.Upload = Upload;
});
