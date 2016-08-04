$(function(){


    getList()


})

function getList(){
 $.ajax({
        type: "get",
        url: "/list",
        success: function(msg){
           console.log(msg['msg'])

           imglist(msg['msg'])
        }

    });

}

function imglist(arr){

    var stc = '';

    for(index in arr){

        stc += '<img class="col-sm-offset-2 col-sm-4" src="'+ arr[index] +'" />'

    }

    $("#imglist").html(stc)

}