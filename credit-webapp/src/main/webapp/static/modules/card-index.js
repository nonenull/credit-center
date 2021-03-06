var $table = $('#table');
$(function() {
    $(document).on('focus', 'input[type="text"]', function() {
        $(this).parent().find('label').addClass('active');
    }).on('blur', 'input[type="text"]', function() {
        if ($(this).val() === '') {
            $(this).parent().find('label').removeClass('active');
        }
    });
    // bootstrap table初始化
    // http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
    $table.bootstrapTable({
        // url: '/static/resources/data/data1.json',
        url: '/card/findAll',
        height: getHeight(),
        striped: true,
        search: true,
        searchOnEnterKey: true,
        showRefresh: true,
        showToggle: true,
        showColumns: true,
        minimumCountColumns: 2,
        showPaginationSwitch: true,
        clickToSelect: true,
        detailView: true,
        detailFormatter: 'detailFormatter',
        pagination: true,
        paginationLoop: false,
        classes: 'table table-hover table-no-bordered',
        // sidePagination: 'server',
        dataField: 'result',
        totalField: 'total',
        //silentSort: false,
        smartDisplay: false,
        idField: 'id',
        sortName: 'id',
        sortOrder: 'desc',
        escape: true,
        maintainSelected: true,
        toolbar: '#toolbar',
        columns: [
            {field: 'state', checkbox: true},
            {field: 'id', title: '编号', sortable: true, halign: 'center', visible: false},
            {field: 'name', title: '卡片名称', sortable: true, halign: 'center'},
            {field: 'user.nickName', title: '用户名称', sortable: true, halign: 'center'},
            {field: 'cardNo', title: '卡号', sortable: true, halign: 'center', visible: false},
            {field: 'bankId', title: '所属银行', sortable: true, halign: 'center', visible: false},
            {field: 'cardType', title: '卡片类型', sortable: true, halign: 'center', visible: false},
            {field: 'cardLimit', title: '额度', sortable: true, halign: 'center'},
            {field: 'billDay', title: '账单日', sortable: true, halign: 'center'},
            {field: 'repayDayType', title: '还款日类型', sortable: true, halign: 'center'},
            {field: 'repayDayNum', title: '款款日记数', sortable: true, halign: 'center'},
            {field: 'status', title: '状态', sortable: true, halign: 'center'},
            {field: 'createBy', title: '创建人', halign: 'center', align: 'center'},
            {field: 'createAt', title: '创建时间', sortable: true, halign: 'center', align: 'center', formatter: 'formatDate'},
            {field: 'updateBy', title: '更新人', halign: 'center', align: 'center', visible: false},
            {field: 'updateAt', title: '更新时间', sortable: true, halign: 'center', align: 'center', formatter: 'formatDate', visible: false},
            {title: '操作', halign: 'center', align: 'center', formatter: 'actionFormatter', events: 'actionEvents', clickToSelect: false},
        ]
    }).on('all.bs.table', function (e, name, args) {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
    });
});
function actionFormatter(value, row, index) {
    return [
        '<a class="like" href="javascript:void(0)" data-toggle="tooltip" title="Like"><i class="glyphicon glyphicon-heart"></i></a>　',
        '<a class="edit ml10" href="javascript:void(0)" data-toggle="tooltip" title="Edit"><i class="glyphicon glyphicon-edit"></i></a>　',
        '<a class="remove ml10" href="javascript:void(0)" data-toggle="tooltip" title="Remove"><i class="glyphicon glyphicon-remove"></i></a>'
    ].join('');
}

function formatDate(value, row, index) {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
}

window.actionEvents = {
    'click .like': function (e, value, row, index) {
        alert('You click like icon, row: ' + JSON.stringify(row));
        console.log(value, row, index);
    },
    'click .edit': function (e, value, row, index) {
        alert('You click edit icon, row: ' + JSON.stringify(row));
        console.log(value, row, index);
    },
    'click .remove': function (e, value, row, index) {
        var url = "/card/remove/" + row.id;
        $.post(url, function(data){
            $table.bootstrapTable("refresh");
        });
    }
};
function detailFormatter(index, row) {
    var html = [];
    $.each(row, function (key, value) {
        html.push('<p><b>' + key + ':</b> ' + value + '</p>');
    });
    return html.join('');
}
// 新增
function createAction() {
    $.confirm({
        columnClass: 'medium',
        type: 'dark',
        animationSpeed: 300,
        title: '新增卡片',
        content: $('#createDialog').html(),
        buttons: {
            confirm: {
                text: '提交',
                btnClass: 'waves-effect waves-button',
                action: function () {
                    var params = new Object();
                    params.name = this.$content.find("#createForm input[name='name']").val();
                    params.cardLimit = this.$content.find("#createForm input[name='cardLimit']").val();
                    params.billDay = this.$content.find("#createForm input[name='billDay']").val();
                    params.repayDayType = this.$content.find("#createForm input[name='repayDayType']:checked").val();
                    params.repayDayNum = this.$content.find("#createForm input[name='repayDayNum']").val();
                    // 新增人是系统
                    params.userId = 1;

                    var url = '/card/save';
                    $.ajax({
                        url: url,
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(params),
                        success: function(data) {
                            if (data.head === null) {
                                $.alert('server error!');
                            }
                            $table.bootstrapTable("refresh");
                        }
                    });

                }
            },
            cancel: {
                text: '取消',
                btnClass: 'waves-effect waves-button'
            }
        }
    });
}
// 编辑
function updateAction() {
    var rows = $table.bootstrapTable('getSelections');
    if (rows.length !== 1) {
        $.confirm({
            title: false,
            content: '请选择一条记录！',
            autoClose: 'cancel|3000',
            backgroundDismiss: true,
            buttons: {
                cancel: {
                    text: '取消',
                    btnClass: 'waves-effect waves-button'
                }
            }
        });
    } else {
        $.confirm({
            columnClass: 'medium',
            type: 'blue',
            animationSpeed: 300,
            title: '编辑系统',
            content: $('#updateDialog').html(),
            onContentReady: function() {
                var row = rows[0];
                this.$content.find("#updateForm input[name='name']").val(row.name);
                this.$content.find("#updateForm input[name='cardLimit']").val(row.cardLimit);
                this.$content.find("#updateForm input[name='billDay']").val(row.billDay);
                var repayDayType = row.repayDayType;
                this.$content.find("#updateForm input[name='repayDayType'][value='"+ repayDayType +"']").attr("checked", true);
                this.$content.find("#updateForm input[name='repayDayNum']").val(row.repayDayNum);

            },
            buttons: {
                confirm: {
                    text: '确认',
                    btnClass: 'waves-effect waves-button',
                    action: function () {

                        var params = new Object();
                        params.id = + rows[0].id;
                        params.name = this.$content.find("#updateForm input[name='name']").val();
                        params.cardLimit = this.$content.find("#updateForm input[name='cardLimit']").val();
                        params.billDay = this.$content.find("#updateForm input[name='billDay']").val();
                        params.repayDayType = this.$content.find("#updateForm input[name='repayDayType']:checked").val();
                        params.repayDayNum = this.$content.find("#updateForm input[name='repayDayNum']").val();

                        var url = '/card/update';
                        $.ajax({
                            url: url,
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(params),
                            success: function (data) {
                                if (data.head !== null) {
                                    $.alert(data.head.msg);
                                } else {
                                    $.alert('server error!');
                                }
                                $table.bootstrapTable("refresh");
                            }
                        });
                    }
                },
                cancel: {
                    text: '取消',
                    btnClass: 'waves-effect waves-button'
                }
            }
        });
    }
}
// 删除
function deleteAction() {
    var rows = $table.bootstrapTable('getSelections');
    if (rows.length === 0) {
        $.confirm({
            title: false,
            content: '请至少选择一条记录！',
            autoClose: 'cancel|3000',
            backgroundDismiss: true,
            buttons: {
                cancel: {
                    text: '取消',
                    btnClass: 'waves-effect waves-button'
                }
            }
        });
    } else {
        $.confirm({
            type: 'red',
            animationSpeed: 300,
            title: false,
            content: '确认删除吗？',
            buttons: {
                confirm: {
                    text: '确认',
                    btnClass: 'waves-effect waves-button',
                    action: function () {
                        var ids = new Array();
                        for (var i in rows) {
                            ids.push(rows[i].id);
                        }

                        var url = "/card/remove/" + ids.join();
                        $.post(url, function(data){
                            $table.bootstrapTable("refresh");
                        });
                    }
                },
                cancel: {
                    text: '取消',
                    btnClass: 'waves-effect waves-button'
                }
            }
        });
    }
}