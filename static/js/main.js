const FORM_INPUT_DISABLED_COLOR='#000000';//'#e0e2e5';
const FORM_INPUT_MSG_COLOR='#ffffff';//'#00ff00';
const FORM_INPUT_SEND_COLOR='#0000ff';//'#0000ff';
const MSG_MINE_COLOR='#af1d1d';
const MSG_PARTNER_COLOR='#c66e01';

var socket = io();

var timeout;
var partner_id,partner_username,partner_avatar,my_id;
var audio = new Audio('static/sounds/notif.mp3');

$("#messages").scrollTop($("#messages")[0].scrollHeight);
$('#partnername').html(" ");
$('#partnerimg').attr("src"," ");
$('#m').css("pointer-events","none");
$('#m').attr("disabled",true);
$('form button').css("pointer-events","none");
$('form button').attr('disabled',true);
$('#messages').append('<div class="notification is-warning is-light"> Try refreshing if you are not connected to anyone within a minute.   </div>');

function timeoutFunction() {
    socket.emit('typing', false);
}

function isTyping(){
    socket.emit('typing',true);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 1000);        
}

socket.on('typing', function(data) {
    if (data) {
        $("#istyping").css("visibility","visible")      // call function to show typing
    } else {
        $("#istyping").css("visibility","hidden")       // call function to stop typing
    }
});

function submitForm(){
    var msg = $('#m').val();
    if(msg!=''){
        socket.emit('chat message', {msg: msg, target: partner_id});
    }
    $('#m').val('');
    return false;
}

socket.on('init',function (data) {
    socket.username=data.username;
    socket.avatar=data.avatar;
    my_id = data.my_id;
    $('#myname').html(socket.username);
    $('#myimg').attr("src",socket.avatar);
});

socket.on('chat message mine',function(msg){
    var output_msg = msg;
    var newData = '<article style="display:none" class="me message is-info"><div class="message-body" style="text-align:right;border-right-width: 4px;border-left-width: 0;">'+output_msg+'</div></article>';
    $(newData).appendTo($('#messages')).slideDown(speed=200,callback = function(){
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });
    
});


socket.on('chat message partner', function (msg) {
    audio.play();
    var output_msg = msg;        
    var newData = '<article class="partner message is-primary" style="display:none"> <div class="message-body">'+output_msg+'</div>';
    $(newData).appendTo($('#messages')).slideDown(speed=200,callback = function(){
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });

});

socket.on('active users',function(users){
    $('#online').html(users);
});

socket.on('disconnecting now', function (msg) {
    $('#messages').append('<div class="notification is-danger">'+msg+"</div>");
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
    $('#partnername').html(" ");
    $('#partnerimg').attr("src"," ");
    $('#m').css("pointer-events","none");
    $('#m').attr("disabled",true);
    $('form button').css("pointer-events","none");
    $('form button').attr("disabled",true);
    $('#m').attr("placeholder","");
});

socket.on('partner', function (partner_data) {
    if(partner_id==null){
        $('#messages').append("<div class='notification is-primary'>"+'Connected to '+partner_data.username+"</div>");
        $('#partnername').html(partner_data.username);
        $('#partnerimg').attr("src",partner_data.avatar);
        $('#m').css("pointer-events","auto");
        $('#m').attr("disabled",false);
        $('form button').css("pointer-events","auto");
        $('form button').attr("disabled",false);
        partner_id = partner_data.id;
        partner_username=partner_data.username;
        partner_avatar=partner_data.avatar;
        $('#m').attr("placeholder","Type to send a message");
        $('div.emojionearea-editor').attr("placeholder","Type to send a message");
        socket.emit('partner',{target:partner_id,
            data:{id:socket.id,
                username:socket.username,
                avatar:socket.avatar}});
    }
});

$('#next').click(function() {        
    $.ajax({
        type: 'POST',
        url: '/next',
        data: { 
            'next': 'next'
        },
        success: function(data){
            console.log(data)
        }
    });
});

$('#m').on('keyup',function(){
    isTyping();
});