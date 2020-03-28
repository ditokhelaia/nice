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
$('#messages').append('<div class="notification is-warning is-light"> დააჭირე შემდეგს თუ კავშირი არ დამყარდა </div>');

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
    var sp = output_msg.split(' ');
    var msgs = [];
    for(var i=0;i<sp.length; i++){
        var temp = sp[i];
        if(checkURL(sp[i])){
            temp = '<img src="'+ sp[i]+'"';
        }
        msgs.push(temp);
    } 
    output_msg = msgs.join(' ');
    var newData = '<article style="display:none" class="me message is-info"><div class="message-body" style="text-align:right;border-right-width: 4px;border-left-width: 0;">'+output_msg+'</div></article>';
    $(newData).appendTo($('#messages')).slideDown(speed=200,callback = function(){
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });
    
});


socket.on('chat message partner', function (msg) {
    audio.play();
    var output_msg = msg;
    var sp = output_msg.split(' ');
    var msgs = [];
    for(var i=0;i<sp.length; i++){
        var temp = sp[i];
        if(checkURL(sp[i])){
            temp = '<img src="'+ sp[i]+'"';
        }
        msgs.push(temp);
    } 
    output_msg = msgs.join(' ');
    var newData = '<article class="partner message is-primary" style="display:none"> <div class="message-body">'+output_msg+'</div>';
    $(newData).appendTo($('#messages')).slideDown(speed=200,callback = function(){
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });

});

socket.on('active users',function(users){
    $('#online').html(parseFloat(users)+80);
});

socket.on('disconnecting now', function (msg) {
    $('#messages').append('<div class="notification is-danger">'+msg+"</div>");
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
    $('#partnername').html(" ");
    $('#partnerimg').attr("src"," ");
    $('#m').css("pointer-events","none");
    $('#m').attr("disabled",true);
    $('#imgupload').attr("disabled",true);
    $('form button').css("pointer-events","none");
    $('form button').attr("disabled",true);
    $('#imgupload').attr("disabled",true);
    $('#m').attr("placeholder","");
});

socket.on('partner', function (partner_data) {
    if(partner_id==null){
        $('#messages').append("<div class='notification is-primary'>"+'კავშირი არის '+"</div>");
        $('#partnername').html(partner_data.username);
        $('#partnerimg').attr("src",partner_data.avatar);
        $('#m').css("pointer-events","auto");
        $('#m').attr("disabled",false);
        $('#imgupload').attr("disabled",false);
        $('form button').css("pointer-events","auto");
        $('form button').attr("disabled",false);
        partner_id = partner_data.id;
        partner_username=partner_data.username;
        partner_avatar=partner_data.avatar;
        $('#m').attr("placeholder","დაწერე შეტყობინება");
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
$('#next').on('click',function(){
    location.reload();
});

function giphy(query){
    let url = `https://api.giphy.com/v1/gifs/search?q=`+query+`&api_key=bRnyTb5XRC3bH74ZzI5JizPHBohrYPJH`;
    var xhr = new XMLHttpRequest();
    
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            var data = response.data;
            _html = '';
            for (var i=0;i<data.length;i++) {
                _html+='<img src="'+data[i].images.downsized.url+'"/>';
            }
            $('#gif').html(_html);
            $('#gif img').on('click',function(){
                var msg = $(this).attr('src');
                console.log(msg);
                socket.emit('chat message', {msg: msg, target: partner_id});
                $('#gif').html('');
				$('#m').val('');
                return false;
            });
        }
    }
    xhr.open('GET', url, true); 
    xhr.send();
    
}



$('#checkboxid').on('click',function(ev){
    if($(this).is(':checked')) {
        $('#m').attr('placeholder','მოძებნე გიფი');
        document.getElementById("msgform").onkeypress = function(e) {
            var key = e.charCode || e.keyCode || 0;     
            if ($('#checkboxid').is(':checked') && key == 13) {
              e.preventDefault();
              return false;
            }
          }
        $('#m').on('keyup',function(){
            let msg = $('#m').val();
            if(msg.length > 3){
                giphy(msg);
            } 
        });
        $('#submitButton').attr("disabled",true);
    }else{
        $('#m').attr('placeholder','დაწერე შეტყობინება');
        $('#gif').html('');
        $('#submitButton').attr("disabled",false);
    }
})

function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}



function encodeImageFileAsURL() {

    var filesSelected = document.getElementById("imgupload").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
  
        var fileReader = new FileReader();
  
        fileReader.onload = function(fileLoadedEvent) {
          var srcData = fileLoadedEvent.target.result; // <--- data: base64
  
          var newImage = document.createElement('img');
          newImage.src = srcData;
  
          return document.getElementById("imgTest").innerHTML;
        }
        fileReader.readAsDataURL(fileToLoad);
      }
    //return false;
}

$('#imgupload').on('change',function(){
    var filesSelected = document.getElementById("imgupload").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
  
        var fileReader = new FileReader();
  
        fileReader.onload = function(fileLoadedEvent) {
          var srcData = fileLoadedEvent.target.result;
  
          var newImage = document.createElement('img');
          newImage.src = srcData;

          let myimg = newImage.outerHTML;
          if(myimg){
                socket.emit('chat message', {msg: myimg, target: partner_id});
            }
            console.log("Converted Base64 version is " + myimg);

        }
        fileReader.readAsDataURL(fileToLoad);
      }
    
});