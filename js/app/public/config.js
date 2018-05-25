var DataMenu = [

    {
        pname: "管理员系统",
        roleId: "4",
        submens: [{
            href: "../admin/accountmanage.html",
            name: "账号管理"

        }, {
            href: "../admin/schoolmanage.html",
            name: "学校管理"

        }, {
            href: "../admin/classmanage.html",
            name: "班级管理"

        },{
            href: "../teacher/updatepwd.html",
            name: "修改密码"

        }]
    }, {
        pname: "教师系统",
        roleId: "1",
        submens: [{
            href: "../teacher/myclass.html",
            name: "我的班级",
            dot: true,
            domID: "questionRedDot"
        }, {
            href: "../teacher/mylesson.html",
            name: "我的课程"

        }, {
            href: "../teacher/examcentermanage.html",
            name: "我的测试"

        },{
            href: "#",
            name: "我的资源",
            submens: [
            {
                href: "../teacher/task.html",
                name: "我的任务"
            },{
                href: "../teacher/audiomange.html",
                name: "我的媒体"
            },   {
                href: "../teacher/exampager.html",
                name: "我的试卷"

            },{
                href: "../teacher/questionsmange.html",
                name: "我的题库"

            }]
        }, {
            href: "../teacher/messagecenter.html",
            name: "消息中心"

        },{
            href: "../teacher/updatepwd.html",
            name: "修改密码"

        }]
    }, {
        pname: "学生系统",
        roleId: "2",
        submens: [{
            href: "../student/myclassStudent.html",
            name: "我的班级",
            dot: true,
            domID: "questionRedDot"
        }, {
            href: "../student/myexam.html",
            name: "我的试卷"

        }, {
            href: "../student/myquestion.html",
            name: "我的提问"

        }, {
            href: "../student/myLearningSituation.html",
            name: "我的学情"

        }, {
            href: "../student/coursereport.html",
            name: "课程报告"

        }, {
            href: "../student/examreport.html",
            name: "测试报告"

        }, {
            href: "../student/infoCenterStudent.html",
            name: "消息中心",
            dot: true,
            domID: "messageRedDot"

        }, {
            href: "../student/uuid.html",
            name: "UID码"

        },{
            href: "../teacher/updatepwd.html",
            name: "修改密码"

        }]
    }, {
        pname: "家长系统",

        roleId: "3",
        submens: [{
            href: "../parent/bindstudent.html",
            name: "绑定子女"

        }, {
            href: "../parent/learningreport.html",
            name: "学习报告"

        }, {
            href: "../parent/coursereport.html",
            name: "课程报告"

        }, {
            href: "../parent/examreport.html",
            name: "测试报告"

        },{
            href: "../teacher/updatepwd.html",
            name: "修改密码"

        }]
    }
];
