TYPE = "";
TREEDATA = "";

//返回数据处理
function filter(treeId, parentNode, data) {

    //if (data.tagList.length == 0) return [{ isParent: false, tagId: 0, name: "根节点" }];
    var childNodes = null;
    if (!parentNode) {
        childNodes = [{ id: 0, pId: 0, name: "根节点", open: true, isParent: true }].concat(data.tagList);
    } else {
        childNodes = data.tagList;
    }

    for (var i = 0, l = childNodes.length; i < l; i++) {
        childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
    }
    TREEDATA = childNodes;
    return childNodes;
}


var log, className = "dark";

function beforeDrag(treeId, treeNodes) {
    return false;
}

function beforeEditName(treeId, treeNode) {
    if (treeNode.id == 0) {
        return false; }
    className = (className === "dark" ? "" : "dark");
    showLog("[ " + getTime() + " beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    zTree.selectNode(treeNode);
    setTimeout(function() {
        zTree.editName(treeNode);
    }, 0);
    return false;
}

function beforeRemove(treeId, treeNode) {
    if (treeNode.id == 0) {
        return false; }
    className = (className === "dark" ? "" : "dark");
    showLog("[ " + getTime() + " beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    zTree.selectNode(treeNode);
    return confirm("确认删除 节点 -- " + treeNode.name + " 吗？");
}

function onRemove(e, treeId, treeNode) {
    showLog("[ " + getTime() + " onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);

    J.ajax({ url: "/tag/delete", type: 'GET' }, { tagId: treeNode.tagId }, function(data) {


    });
}

function beforeRename(treeId, treeNode, newName, isCancel) {
    className = (className === "dark" ? "" : "dark");
    showLog((isCancel ? "<span style='color:red'>" : "") + "[ " + getTime() + " beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>" : ""));
    if (newName.length == 0) {
        setTimeout(function() {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.cancelEditName();
            alert("节点名称不能为空.");
        }, 0);
        return false;
    }
    return true;
}

function onRename(e, treeId, treeNode, isCancel) {

    //showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));

    var params = {
        tagId: treeNode.tagId,
        name: treeNode.name,
        type: TYPE,
    };
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");

    J.ajax({ url: "/tag/edit", type: 'POST' }, params, function(data) {


    });

}

function showRemoveBtn(treeId, treeNode) {
    return !treeNode.isFirstNode;
}

function showRenameBtn(treeId, treeNode) {
    return !treeNode.isLastNode;
}

function showLog(str) {
    if (!log) log = $("#log");
    log.append("<li class='" + className + "'>" + str + "</li>");
    if (log.children("li").length > 8) {
        log.get(0).removeChild(log.children("li")[0]);
    }
}

function getTime() {
    var now = new Date(),
        h = now.getHours(),
        m = now.getMinutes(),
        s = now.getSeconds(),
        ms = now.getMilliseconds();
    return (h + ":" + m + ":" + s + " " + ms);
}

var newCount = 1;

function addHoverDom(treeId, treeNode) {
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='add node' onfocus='this.blur();'></span>";
    sObj.after(addStr);
    var btn = $("#addBtn_" + treeNode.tId);
    if (btn) btn.bind("click", function() {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var params = {
            parentsTagId: treeNode.tagId,
            name: "新节点",
            type: TYPE,
        };

        J.ajax({ url: "/tag/edit", type: 'POST' }, params, function(data) {

            if (treeNode.id == 0) {
                zTree.addNodes(null, { tagId: data.tagId, parentsTagId: 0, name: data.name });

            } else {
                zTree.addNodes(treeNode, { tagId: data.tagId, parentsTagId: treeNode.tagId, name: data.name });
            }


        });
        return false;
    });
};

function removeHoverDom(treeId, treeNode) {
    $("#addBtn_" + treeNode.tId).unbind().remove();
};

function dblClickExpand(treeId, treeNode) {
   
    return treeNode.tagId > 0;
}





$(document).ajaxSend(function(event, jqxhr, settings) {
    var user = store.get('user');
    if (!user) {
        J.goLogin();
        return;
    }
    jqxhr.setRequestHeader("accessToken", user.accessToken);
});






/**
 *  tree 插件
 *  type:success  failed warning msg confirm  默认msg
 **/
J.$package(function(J) {
    var JTree = new J.Class({
        init: function(param) {
            TYPE = param.type;
            this.tree = null;
            this.tagId = param.tagId;
            var  self = this;
            function onClick(event, treeId, treeNode, clickFlag) {
                param.func && param.func(treeNode.tagId);
            }

            function asyncSuccess(event, treeId, treeNode, clickFlag) {
               
                var zTree = $.fn.zTree.getZTreeObj(treeId);
                //指定了节点
                if(self.tagId){
                    var node = zTree.getNodeByParam("tagId", self.tagId);
                    if(node){
                        zTree.selectNode(node);
                    }
                    param.func && param.func(self.tagId);

                }else if (TREEDATA.length > 0) {
                    var tagId = TREEDATA[0].tagId;
                    if(!tagId && TREEDATA.length > 1){
                        tagId = TREEDATA[1].tagId;
                    }
                    var node = zTree.getNodeByParam("tagId", tagId);
                    if(node){
                        zTree.selectNode(node);
                    }
                    param.func && param.func(tagId);
                }


            }



            var setting = {
                view: {
                    addHoverDom: addHoverDom,
                    removeHoverDom: removeHoverDom,
                    selectedMulti: false,
                    dblClickExpand: dblClickExpand
                },
                edit: {
                    enable: true

                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "tagId",
                        pIdKey: "parentsTagId",

                    }
                },
                async: {
                    enable: true,
                    url: API + "/tag/getList",
                    autoParam: ["tagId=parentsTagId"], //tagId 转成parentsTagId
                    otherParam: { "type": TYPE },
                    dataFilter: filter
                },
                callback: {
                    beforeEditName: beforeEditName,
                    beforeRemove: beforeRemove,
                    beforeRename: beforeRename,
                    onRemove: onRemove,
                    onRename: onRename,
                    onClick: onClick,
                    onAsyncSuccess: asyncSuccess
                }
            };

            this.tree = $.fn.zTree.init($("#treeDemo"), setting);

        },
        checkNode: function(tagId) {
            var node = this.tree.getNodeByParam("tagId", tagId);
            this.tree.selectNode(node);
        }



    })
    J.JTree = J.JTree || {};
    J.JTree = JTree;
});
