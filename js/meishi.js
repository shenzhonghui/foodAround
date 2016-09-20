var M={
	Images:[],
	paras:[{
		url:"Cate/CateList",
		para:{
			pageSize:10
		},
		title:'美食列表'
	},{
		url:"Cate/CateDetail",
		para:{},
		title:'美食详情'
	},{
		url:"Cate/CommentList",
		para:{
			pageSize:10,
		},
		title:'评论列表'
	},{
		url:"Cate/CommentCreate",
		para:{},
		title:'添加评论'
	},{
		url:"Cate/Like",
		para:{},
		title:'点或者踩'
	},{
		url:"Cate/CateCreate",
		para:{},
		title:'美食上传'
	},{
        url:"Cate/CateEdit",
        para:{},
        title:'美食图片添加'
    }],
    XHR:function(url,para,successOK){
    	$.ajax({
            type: "POST",
            url: url,
            timeout: 5e3,
            dataType: "json",
            data: para,
            success: successOK,
            error: function(XMLHttpRequest,textStatus,errorThrown){
            	M.hideIndicator();
            	switch (textStatus){
                    case 'timeout':
                        $.toast('请求超时');
                        setTimeout(function(){
                            page.append('<div class="loadAgain">点击屏幕,重新加载</div>')
                        },2000);
                        break;
                    case 'abort':
                        $.toast('网络错误,请检查网络连接');
                        break;
                    default:
                        $.toast('请求失败，请稍后重试');
                }
            }
        })
    },
    //获取美食数据
    MsLists:function(pageNum){
    	if(M.paras.length>0){
    		var l=M.paras[0];
    		var tt = new Date().getTime();
    		M.showIndicator();
    		//请求参数
    		l.para.pageCurrent=pageNum;
    		M.XHR(l.url+"?tt="+tt,l.para,function(rep){
    			M.hideIndicator();
    			if(rep.Message=="Success"){
    				var data=rep.Data;
    				M.MsListsDom(data);
    			}else{
    				$.toast(rep.Detail);
    			}
    		})

    	}
    	
    },
    //美食列表Dom
    MsListsDom:function(data){
    	if(data.length==0) return $('#loadMore').show().html('没有更多啦');
    	var html="";
    	$.each(data,function(inx,itm){
    		html+='<li class="card" data-ID="'+itm.ID+'"><div class="item-content no-border" data-url="meishi2.html">'
    		html+='<div class="item-media"><img src="'+itm.ImageUrl+'" width="60" onerror="M.errorImg(this,1)"></div>'
            html+='<div class="item-inner"><div class="item-title-row">'
            html+='<div class="item-title">'+itm.SellerName+'</div></div>'
            html+='<div class="item-subtitle">'+itm.SellerAddress+'</div></div></div>'  
            html+='<div class="card-footer no-border"><a href="#" class="link" data-like="like">'+itm.TotalLike+'</a>'                   
            html+='<a href="#" class="link" data-dislike="dislike">'+itm.TotalUnLike+'</a>'
            html+='<a href="#" class="link" data-comment="comment">'+itm.TotalComment+'</a></div></li>'        
    	})
    	html+="";
        if(data.length>=10){
            $('#loadMore').show();
        }
    	$('#meisListsBlock').append('<ul>'+html+'</ul>');
    },
    //点赞
    setLikeValue:function(id,like,unlike,callbackOk){
    	if(M.paras.length>0){
    		var l=M.paras[4];
    		// M.showIndicator();
    		//请求参数
    		l.para.id=id;
    		l.para.like=like;
    		l.para.unlike=unlike;
    		M.XHR(l.url,l.para,function(rep){
    			M.hideIndicator();
    			if(rep.Message=="Success"){
    				// $.toast(rep.Detail);
                    if(callbackOk) callbackOk();
    			}else{
    				$.toast(rep.Detail);
    			}
    		})

    	}
    },
    //踩
    setDisLikeValue:function(){

    },
    //评论
    setCommentValueComment:function(){

    },
    //评论列表
    CommentLists:function(pageNum){
    	if(M.paras.length>0){
    		var l=M.paras[2];
    		M.showIndicator();
    		//请求参数
    		l.para.id=$.getPar('d');
    		l.para.pageCurrent=pageNum;
    		M.XHR(l.url,l.para,function(rep){
    			M.hideIndicator();
    			if(rep.Message=="Success"){
    				var data=rep.Data;
    				M.CmtListDom(data);
    			}else{
    				$.toast(rep.Detail);
    			}
    		})

    	}
    },
    //添加评论列表
    addCmtList:function(){
    	var commentTextarea=$('#commentTextarea').val();
    	if(commentTextarea||M.Images.length>0){
            if(M.paras.length>0){
            var l=M.paras[3];
            M.showIndicator();
            //提交的参数
            l.para.id=$.getPar('d');
            l.para.token=$.getPar('tk');
            l.para.comment=commentTextarea;
            l.para.images=M.Images.join(',');
            M.XHR(l.url,l.para,function(rep){
                M.hideIndicator();
                if(rep.Message=="Success"){
                    //清空评论框和图片
                    $('#commentTextarea').val('');
                    $('.weui_uploader_files').empty();
                    M.Images=[];
                    $.toast(rep.Detail);
                    var data=JSON.parse(rep.Data);
                    // console.log(data);
                    var html='<li class="item-content magictime spaceInUp">'
                        html+='<div class="item-inner"><div class="item-title-row">'
                        html+='<div class="item-title">'+data.CommenterName+'</div><div class="item-after">'+data.CommentTime+'</div></div>'
                        html+='<div class="item-text">'+data.CommentContent+'</div>'
                        //评论图片图片显示
                        if(data.CommentContentImageUrl){
                            var urls=data.CommentContentImageUrl.split(',');
                            if(urls.length>0){
                                html+='<ul class="downloader_files" data-photos="'+urls+'">'
                                for (var i = 0; i < urls.length; i++) {
                                    html+='<li class="downloader_file" style="background-image:url('+urls[i]+')"></li>'
                                };
                                html+='</ul>';
                                $(document).on("click",'.downloader_file',function(e){
                                    var urls=$(this).parent().attr('data-photos');
                                    urls=urls.split(',');
                                    var myPhotos=M.photoBrowser(urls);
                                    myPhotos.open($(this).index());
                                })
                            }
                        }
                        html+='</div></li>';
                    $('#meisCommentListsBlock').prepend(html);
                    //更新饭友评论数量
                    $('#fanyouComments span').html(parseInt($('#fanyouComments span').html())+1);
                }else{
                    $.toast(rep.Detail);
                }
            })
            }
        }else{
            return $.toast('请输入内容')
        }
    },
    //评论列表Dom
    CmtListDom:function(data){
    	if(data.length==0) return $('#loadMore').show().html('没有更多啦');;
    	var html="";
    	$.each(data,function(inx,itm){
    		html+='<li class="item-content">'
            html+='<div class="item-inner"><div class="item-title-row">'
            html+='<div class="item-title">'+itm.CommenterName+'</div><div class="item-after">'+itm.CommentTime+'</div></div>'
            html+='<div class="item-text">'+itm.CommentContent+'</div>'
            //评论图片图片显示
            if(itm.CommentContentImageUrl){
                var urls=itm.CommentContentImageUrl.split(',');
                if(urls.length>0){
                    html+='<ul class="downloader_files" data-photos="'+urls+'">'
                    for (var i = 0; i < urls.length; i++) {
                        html+='<li class="downloader_file" style="background-image:url('+urls[i]+')"></li>'
                    };
                    html+='</ul>';
                    $(document).on("click",'.downloader_file',function(e){
                        var urls=$(this).parent().attr('data-photos');
                        urls=urls.split(',');
                        var myPhotos=M.photoBrowser(urls);
                        myPhotos.open($(this).index());
                    })
                }
            }
            html+='</div></li>'
    	})
    	html+="";
    	if(data.length>=10){
    		$('#loadMore').show();
    	}
    	$('#meisCommentListsBlock').append('<ul>'+html+'</ul>');
    },
    //图片浏览器
    photoBrowser:function(urls){
        var myPhotos=$.photoBrowser({
            photos:urls,
            onTap:function(swiper,event){
                myPhotos.close();
            }
        });
        return myPhotos;
    },
    //图片点击事件
    photoClicks:function(e,urls){
        var myPhotos=M.photoBrowser(urls);
        myPhotos.open($(e.target).index());
    },
    //错误图片
    errorImg:function(obj,errorNum){
    	var img= "./img/default"+errorNum+".png";
		obj.onerror = null;
		obj.src=img;
    },
    //加载条
    showIndicator:function(){
        $('body').append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
    },
    hideIndicator:function() {
        $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
    },
    //美食详情页
    MsDetail:function(id){
    	if(M.paras.length>0){
    		var l=M.paras[1];
    		M.showIndicator();
    		l.para.id=id;
    		M.XHR(l.url,l.para,function(rep){
    			M.hideIndicator();
    			if(rep.Message=="Success"){
    				var data=JSON.parse(rep.Data);
                    //美食名字
                    if(data.SellerName){
                        $('.meishi-header-title').html(data.SellerName);
                    }
                    //美食推荐人
                    if(data.CreateUserName){
                        $('#ms-create-name').html(data.CreateUserName);
                    }
                    $('#meisListsBlock').empty();
                    if(data.ImageUrl){
                        var urls=data.ImageUrl.split(',');
                        //添加背景图
                        $('.meishi-header').css('backgroundImage','url('+urls[0]+')');
                        //美食相册                                                                                          
                        $('.meishi-header-bottom').html('相册('+urls.length+')');
		            	var html='<ul class="downloader_files" data-photos="'+urls+'">'
						for (var i = 0; i < urls.length; i++) {
							html+='<li class="downloader_file" style="background-image:url('+urls[i]+')"></li>'
						};
						html+='</ul>';
						// var myPhotos=$.photoBrowser({
			   //              photos:urls,
			   //              onClick:function(swiper, e){
			   //              	myPhotos.close();
			   //              }

			   //          });
                        $(document).on("click",'.downloader_file',function(e){
                            var urls=$(this).parent().attr('data-photos');
                            urls=urls.split(',');
                            var myPhotos=M.photoBrowser(urls);
                            myPhotos.open($(this).index());
                        })
		              $('#meisListsBlock').append(html);
                    }else{
                        //相册为空，添加默认图片
                        $('.meishi-header').css('backgroundImage','url(img/def.jpg)');
                    }
                    //美食地址
                    if(data.SellerAddress){
                        $("#meishi-address").html(data.Reason);
                        $('.meishi-subheader').show();
                    }
                    //推荐理由
		            if(data.Reason){
		            	$(".tj-reason").html(data.Reason);
		            	$('.tj-list-block').show();
		            }
		            $('#storageID').val(data.ID);
		            $("#storageComment").val(data.TotalComment);
		            //添加饭友评论数量
        			$('#fanyouComments span').html(data.TotalComment);
    			}else{
    				$.toast('请求失败');
    			}
    		})

    	}
    },
    //图片读取
    readFile: function(obj) {
		var files = obj.files;
		if (files.length > 9) {
            $.toast("最多同时只可上传9张图片");
            return;
        }
		for(var i=0;i<files.length;i++){
			var file=files[i];
			//判断类型是不是图片
			if (!/\/(?:jpeg|png|gif)/i.test(file.type)){
				$.toast("请确保文件为图像类型");
				return false;
			} 
			// if (!/image\/\w+/.test(file.type)) {
			// 	$.toast("请确保文件为图像类型");
			// 	return false;
			// }
			var reader = new FileReader();
			reader.onload = function(e) {
				var Images = M.Images;
				var rep=this.result;
				var img = new Image();
				
			    var maxsize = 100 * 1024;
                img.src = rep;
                //如果图片大小小于100kb，则直接上传
                if (rep.length <= maxsize) {
                	//插入dom
                	var html='<li class="weui_uploader_file" style="background-image:url(' + rep + ')"></li>'
					$('.weui_uploader_files').before(html);
                    img = null;
                    //图片上传
                    rep=rep.substr(rep.indexOf('base64')+7);
                    Images.push(rep);
                    return;
                }
                //图片加载完毕之后进行压缩，然后上传
                if (img.complete) {
                    callback();
                } else {
                    img.onload = callback;
                }
                function callback() {
                    var data = M.compress(img);
                    var html='<li class="weui_uploader_file" style="background-image:url(' + data + ')"></li>'
                    $('.weui_uploader_files').before(html);
                    data=data.substr(rep.indexOf('base64')+7);
					//图片上传
                    Images.push(data);
                    img = null;
                }
                
				// rep=rep.substr(rep.indexOf('base64')+7);
				// Images.push(rep);
				// M.Images = Images;
				// var html='<li class="weui_uploader_file" style="background-image:url(' + this.result + ')"></li>'
				// $('.weui_uploader_files').before(html);
			}
			reader.readAsDataURL(file);
		}
	},
	//图片上传
	upload:function(basestr,type){
		var text = window.atob(basestr.split(",")[1]);
        var buffer = new ArrayBuffer(text.length);
        var ubuffer = new Uint8Array(buffer);
        var pecent = 0 , loop = null;
        for (var i = 0; i < text.length; i++) {
            ubuffer[i] = text.charCodeAt(i);
        }

        var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
        var blob;

        if (Builder) {
            var builder = new Builder();
            builder.append(buffer);
            blob = builder.getBlob(type);
        } else {
            blob = new window.Blob([buffer], {type: type});
        }
        var formdata = new FormData();
        formdata.append('imagefile', blob);
        return formdata;
	},
	//压缩图片
	compress:function(img){
		//    用于压缩图片的canvas
	    var canvas = document.createElement("canvas");
	    var ctx = canvas.getContext('2d');
	    //    瓦片canvas
	    var tCanvas = document.createElement("canvas");
	    var tctx = tCanvas.getContext("2d");
        var initSize = img.src.length;
        var width = img.width;
        var height = img.height;
        //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
        var ratio;
        if ((ratio = width * height / 4000000) > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            height /= ratio;
        } else {
            ratio = 1;
        }
        canvas.width = width;
        canvas.height = height;
        //铺底色
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //如果图片像素大于100万则使用瓦片绘制
        var count;
        if ((count = width * height / 1000000) > 1) {
            count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
            //计算每块瓦片的宽和高
            var nw = ~~(width / count);
            var nh = ~~(height / count);
            tCanvas.width = nw;
            tCanvas.height = nh;
            for (var i = 0; i < count; i++) {
                for (var j = 0; j < count; j++) {
                    tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                    ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                }
            }
        } else {
            ctx.drawImage(img, 0, 0, width, height);
        }
        //进行最小压缩
        var ndata = canvas.toDataURL('image/jpeg', 0.1);
        console.log('压缩前：' + initSize);
        console.log('压缩后：' + ndata.length);
        console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
        tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
        return ndata;
	}, 
	//美食上传
	MsUpload:function(){
		if(M.paras.length>0){
    		var l=M.paras[5];
    		var temptime = new Date().getTime();
    		M.showIndicator();
    		//请求参数
    		l.para.token=$.getPar('tk');
    		l.para.name=$('#tjName').val();
    		l.para.address=$('#tjAddress').val();
    		l.para.reason=$('#tjReason').val();
    		l.para.images=M.Images.join(',');
    		M.XHR(l.url,l.para,function(rep){
    			M.hideIndicator();
    			if(rep.Message=="Success"){
    				$.toast(rep.Detail);
    				//跳转到美食列表
    				var g="meishi.html";
    				location.href=g+"?token="+encodeURI($.getPar('tk'))+"&random="+temptime;
    			}else{
    				$.toast(rep.Detail);
    			}
    		})
    	}
	},
    //美食图片添加
    MsAddImages:function(){
        if(M.paras.length>0){
            var l=M.paras[6];
            var temptime = new Date().getTime();
            M.showIndicator();
            //请求参数
            l.para.token=$.getPar('tk');
            l.para.id=$.getPar('d');
            // l.para.reason=$('#tjReason').val();
            l.para.images=M.Images.join(',');
            M.XHR(l.url,l.para,function(rep){
                M.hideIndicator();
                if(rep.Message=="Success"){
                    $.toast(rep.Detail);
                    //刷新数据
                    M.MsDetail(l.para.id);
                    $('.weui_uploader_files').empty();
                    M.Images=[];
                    $(".comment-overlay").remove();
                    $("#tanchu-bar").removeClass('tanchu-in')
                    //跳转到美食列表
                    // var g="meishi2.html";
                    // location.href=g+"?d="+encodeURI($.getPar('d'))+"&tk="+encodeURI($.getPar('tk'))+"&t="+temptime;
                }else{
                    $.toast(rep.Detail);
                }
            })
        }
    },
	//图片删除
	MsDelete:function(obj,inx){
		//从Images数组中删除
		var src=obj.css('backgroundImage');
		M.Images.splice(inx,1);
		//删除节点
		$(obj).remove();
	},
    //图片上传压缩旋转
    selectFileImage:function(obj) {
        var files = obj.files;
        if (files.length > 9) {
            $.toast("最多同时只可上传9张图片");
            return;
        }
        //图片方向角 added by lzk
        var Orientation = null;
        for(var i=0;i<files.length;i++){
            var file=files[i];
            //判断类型是不是图片
            if (!/\/(?:jpeg|png|gif|jpg)/i.test(file.type)){
                $.toast("请确保文件为图像类型");
                return false;
            }
            var URL = URL || webkitURL;
            //获取照片方向角属性，用户旋转控制
            EXIF.getData(file, function() {
                EXIF.getAllTags(this); 
                Orientation = EXIF.getTag(this, 'Orientation');
                //return;
            });
            var reader = new FileReader();
            reader.onload = function(e) {
                var Images = M.Images;
                var rep=this.result;
                var img = new Image();
                img.src = rep;
                img.onload = function() {
                    var expectWidth = this.naturalWidth;
                    var expectHeight = this.naturalHeight;
                    
                    if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
                        expectWidth = 800;
                        expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
                    } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
                        expectHeight = 1200;
                        expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
                    }
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    canvas.width = expectWidth;
                    canvas.height = expectHeight;
                    ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
                    
                    var base64 = null;
                    // var mpImg = new MegaPixImage(image);
                    //     mpImg.render(canvas, {
                    //         maxWidth: 800,
                    //         maxHeight: 1200,
                    //         quality: 0.8,
                    //         orientation: Orientation
                    //     });
                        
                    // base64 = canvas.toDataURL("image/jpeg", 0.8);
                    
                    //修复ios
                    if (navigator.userAgent.match(/iphone/i)) {
                        console.log('iphone');
                        //如果方向角不为1，都需要进行旋转 added by lzk
                        if(Orientation != "" && Orientation != 1){
                            switch(Orientation){
                                case 6://需要顺时针（向左）90度旋转
                                    rotateImg(this,'left',canvas);
                                    break;
                                case 8://需要逆时针（向右）90度旋转
                                    rotateImg(this,'right',canvas);
                                    break;
                                case 3://需要180度旋转
                                    rotateImg(this,'right',canvas);//转两次
                                    rotateImg(this,'right',canvas);
                                    break;
                            }       
                        }
                        
                        var mpImg = new MegaPixImage(img);
                        mpImg.render(canvas, {
                            maxWidth: 800,
                            maxHeight: 1200,
                            quality: 0.8,
                            orientation: Orientation
                        });
                        base64 = canvas.toDataURL("image/jpeg", 0.8);
                    }else if (navigator.userAgent.match(/Android/i)) {// 修复android
                        var encoder = new JPEGEncoder();
                        base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 80);
                    }else{
                        if(Orientation != "" && Orientation != 1){
                            switch(Orientation){
                                case 6://需要顺时针（向左）90度旋转
                                    rotateImg(this,'left',canvas);
                                    break;
                                case 8://需要逆时针（向右）90度旋转
                                    rotateImg(this,'right',canvas);
                                    break;
                                case 3://需要180度旋转
                                    rotateImg(this,'right',canvas);//转两次
                                    rotateImg(this,'right',canvas);
                                    break;
                            }       
                        }
                        var mpImg = new MegaPixImage(image);
                        mpImg.render(canvas, {
                            maxWidth: 800,
                            maxHeight: 1200,
                            quality: 0.8,
                            orientation: Orientation
                        });
                        base64 = canvas.toDataURL("image/jpeg", 0.8);
                    }
                    //uploadImage(base64);
                    //文件上传
                    var html='<li class="weui_uploader_file" style="background-image:url(' + base64 + ')"></li>'
                        $('.weui_uploader_files').prepend(html);
                        var data=base64.substr(rep.indexOf('base64')+7);
                        Images.push(data);
                        img=null;
                };
            };
            reader.readAsDataURL(file);
        }
        //对图片旋转处理 added by lzk
        function rotateImg(img, direction,canvas) {
                //alert(img);
                //最小与最大旋转方向，图片旋转4次后回到原方向  
                var min_step = 0;  
                var max_step = 3;  
                //var img = document.getElementById(pid);  
                if (img == null)return;  
                //img的高度和宽度不能在img元素隐藏后获取，否则会出错  
                /*var height = img.height;  
                var width = img.width;  */
                var height = canvas.height;  
                var width = canvas.width;  
                //var step = img.getAttribute('step');  
                var step = 2;  
                if (step == null) {  
                    step = min_step;  
                }  
                if (direction == 'right') {  
                    step++;  
                    //旋转到原位置，即超过最大值  
                    step > max_step && (step = min_step);  
                } else {  
                    step--;  
                    step < min_step && (step = max_step);  
                }  
                //img.setAttribute('step', step);  
                /*var canvas = document.getElementById('pic_' + pid);  
                if (canvas == null) {  
                    img.style.display = 'none';  
                    canvas = document.createElement('canvas');  
                    canvas.setAttribute('id', 'pic_' + pid);  
                    img.parentNode.appendChild(canvas);  
                }  */
                //旋转角度以弧度值为参数  
                var degree = step * 90 * Math.PI / 180;  
                var ctx = canvas.getContext('2d');  
                switch (step) {  
                    case 0:  
                        canvas.width = width;  
                        canvas.height = height;  
                        ctx.drawImage(img, 0, 0);  
                        break;  
                    case 1:  
                        canvas.width = height;  
                        canvas.height = width;  
                        ctx.rotate(degree);  
                        ctx.drawImage(img, 0, -height);  
                        break;  
                    case 2:  
                        canvas.width = width;  
                        canvas.height = height;  
                        ctx.rotate(degree);  
                        ctx.drawImage(img, -width, -height);  
                        break;  
                    case 3:  
                        canvas.width = height;  
                        canvas.height = width;  
                        ctx.rotate(degree);  
                        ctx.drawImage(img, -width, 0);  
                        break;  
                }  
        }  

        /** 记录上传数据 */
        function uploadImage(imageData) {
            if (imageData) {
                $.ajax({
                    type: "post",
                    async: false,
                    url: basePath + "goods/savePic/",
                    data: {
                        baseStr: imageData,
                        number: currImgGroup
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (data.id > 0) {
                            var curImg = $("#uploadImg_" + currImgGroup);
                            curImg.attr("src", ossPath + data.remark);
                            if (!$("#lPicUrl").val() || $("#lPicUrl").val() == "") {
                                $("#lPicUrl").val(data.remark);
                            } else {
                                $("#lPicUrl").val($("#lPicUrl").val() + "," + data.remark);
                            }
                            setImgShow(data.remark);
                        } else {
                            console.log(data.msg, false);
                        }
                    }
                });
            }
        }
    },
	//空操作
    noop: function() {}
}

