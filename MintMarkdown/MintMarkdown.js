/*自动加载css*/
(function(){
	var path = $("script").last().attr("src");
	
	path = path.replace(path.substring(path.lastIndexOf("/")+1), "");
	
	//样式统一放在css下，统一命名为style.css
	$("head:first")
		.append($('<link rel="stylesheet"/>').attr("href", path+"css/style.css"))
		.append($('<link rel="stylesheet"/>').attr("href", path+"css/article.css"))
		.append($('<link rel="stylesheet"/>').attr("href", path+"lib/highlight/css/atelier-dune.light.min.css"))
		.append($('<script/>').attr("src", path+"lib/highlight/highlight.min.js"))
		.append($('<script/>').attr("src", path+"lib/marked.min.js"));
})();


/**
 * @author liangwei(895925636@qq.com)
 * @param {Object} tool
 * @param {Object} body
 * @param {Object} tools
 * @param {Object} setting
 */
function MintMarkdown(tool, body, tools, setting, previewOn){
	var thiz = this;
	
	thiz.setting = $.extend({
		/*插入文件一些配置*/
		insertImg : {
			uploadUrl : "", 	//上传文件的url
			loadUrl : "",	//获取图片的url，
			deleteUrl : "", 	//删除图片的url，当点击删除按钮时发送post请求的url。
			/*
			 * 根据loadUrl获取到数据，或者uploadUrl返回的数据，都交给此函数处理，
			 * 请返回一个对象数组，数组内的对象必须包含name属性和src属性。这些对象会在
			 * 删除图片时，随请求一起发回给服务器
			 * 如：[{
			 * 		name : "img.jpg", //显示图片名
			 * 		src : "http://localhost/imgs/img.jpg", //图片路径
			 * }]
			 */
			imgDataFilter : function(data){}
		}
	}, setting);
	
	thiz.prevOn = previewOn;

	/*编辑器工具栏*/
	thiz.tool = $('<ul class="mint_markdown_toolbar"/>').appendTo($($(tool)[0]));
	
	/*初始化编辑空间*/
	var b =  $($(body)[0]);
	
	/*编辑器主体*/
	thiz.input = $('<textarea class="mint_markdown_input" spellcheck="false" autocomplete="off"></textarea>').html(b.html());
	
	/*生成预览区域*/
	thiz.preview = $('<div class="mint_markdown_preview article"></div>').appendTo(b);
	thiz.prev();
	/*
	 * wrap 的作用很特殊，在某些情况下，虽然光标或者选区在editor_body内，
	 * 但是获取得的parentNode（parentElement）却显示
	 * parentNode是editor_body的父元素。暂时发现两种这种情况：
	 * 编辑器内没有任何内容时；光标停在编辑器中纯文本内容时。
	 */
	thiz.body = $('<div class="mint_markdown_body">')
					.append($("<div class='input_wraper'/>").append(thiz.input))
					.append($("<div class='preview_wraper'/>").append(thiz.preview))
					.appendTo(b.empty());
	
	thiz.inputWraper = thiz.input.parent();
	
	if(thiz.prevOn){
		thiz.body.addClass("preview_on");
	}
	
	/*保存选区现场*/
	thiz.input.on("mouseup keyup mouseleave", function(e){
		thiz.saveScene();
	}).on("input propertychange", function(e){ /*监听输入事件，实现在预览区域实时输出效果*/
		thiz.prev();
	});
	
	/*监听工具栏的事件*/
	thiz.tool.delegate("li", "click", function(e){
		var button = $(this);
		var op = button.attr("op"); //operation:操作
		var fn = button.attr("fn"); //function:回调函数
		var val = button.attr("val");
		
		if(op){
			/*回复光标位置*/
			thiz.restoreScene();
			if(/fb-/.test(op)){
				thiz.exeCmd('formatBlock', false, '<'+op.substr(3)+'>');
			} else {
				if(!val) val=null;
				thiz.exeCmd(op, false, val);
			}
		}
		
		if($(e.target).is(".tool")){
			if(fn){
				thiz.tools[fn].fn(thiz, button, e);
			}
		}
	});
	
	
	/*初始化工具栏*/
	(function(){
		if(!tools){
			tools = ["undo", "redo", "|", "insertImg", "preview", "leftRight", "rightLeft"];
		}
		
		var tool, button, ts={};
		$.each(tools, function(i, t){
			if(t!="|"){
				ts[t] = thiz.tools[t];
			} else {
				ts["split"+i] = {type:"0"};
			}
		});
		
		for(var i in ts){
			tool = ts[i];
			
			if(tool.type == "0"){
				button = $('<li class="split"></li>');
			} else {
				button = $('<li class="tool"></li>').attr("title", tool.title).addClass(i);
				if(tool.fn){
					button.attr("fn", i); //带回掉函数的工具栏按钮	
				} else if(tool.isFB){
					button.attr("op", "fb-"+i); //格式化工具栏按钮。对应document.execCommand(formatBlock, false, xx) 命令
				} else {
					button.attr("op", i); //普通的工具栏按钮，比如斜体、粗体、居中等
				}
				
				if(tool.init){
					tool.init(thiz, button);
				}
			}
			
			//为ie加上unselectable属性，防止工具栏获取焦点。其他浏览器用user-select样式
			thiz.tool.append(button.attr("unselectable", "on"));
		}
	})();
}

MintMarkdown.prototype = {
	/*
	 * 获得编辑器的内容
	 */
	html : function(){
		var html = $("<div>").html(marked(editor.input.val()));
		
		for(var i=1; i<8; i++){
			html.find("h"+i).each(function(j, t){
				t = $(t);
				t.attr("id","h"+i+"_"+j);
			});
		}
		
		return html.html();
	},
	
	/*获取文章的目录*/
	getCatalogue : function(){
		var hs =  $("<div>").html(this.html()).find("h1,h2,h3,h4,h5,h6,h7");
		
		hs.each(function(i, t){
			t = $(t);
			t.attr("for", t.attr("id")).removeAttr("id");
		});
		
		return $("<div/>").append(hs).html().trim();
	},
	
	/**/
	prev : function(){
		if(this.prevOn){
			var html = $(marked(this.input.val()));
			html.find('code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
			
			this.preview.html(html);
		}
	},
	
	
	/**
	 * 获取或者设置编辑器的内容
	 */
	text : function(txt){
		if(txt!=undefined && txt!=""){
			this.input.val(txt);
			this.prev();
		} else {
			return this.input.val();
		}
	},
	
	/*
	 * 执行编辑命令
	 */
	exeCmd : function(cmd, asdu, argument) {
		if(this.RG){
			this.restoreScene();
			document.execCommand(cmd, asdu, argument);
			this.saveScene();
		}
	},
	/**
	 * 插入字符
	 * @param txt
	 */
	insertTxt : function(txt){
		if(txt!=undefined && txt!=""){
			var rg = this.RG,
				input = this.input;
			if(rg){
				if(rg.select){
					rg.text = txt;
				} else {
					var	val = input.val();
					
					input.val(val.substring(0,rg.start)+txt+val.substring(rg.end));
					input.selectionStart = rg.start+txt.length;
					input.selectionEnd = rg.start+txt.length;
				}
				
				this.saveScene();
				this.prev();
			}
		}
	},
	
	/*恢复选区现场*/
	restoreScene : function(){
		if(this.RG){
			var input = this.input[0];
			if('selectionStart' in input){  //W3C
				var rg = this.RG;
				input.selectionStart = rg.start;
				input.selectionEnd = rg.end;
				input.focus();
			} else { // < IE9
				this.RG.select();
			}
		}
	},
	
	/*
	 * 保存选区现场
	 * 编辑框失去焦点时的选区现场
	 */
	saveScene : function(){
		/*获取光标或者选区*/
		var rg, txt = this.input[0];
		if ('selectionStart' in txt) {
			rg = {
				start : txt.selectionStart,
				end : txt.selectionEnd
			};
			this.RG = rg;
		} else { // < IE9
			var rg = document.selection.createRange();
			if (rg.parentElement() === txt) {
				this.RG = rg;
			}
		}
	},
	
	/*
	 * 工具栏的工具
	 */
	tools : {
		/*撤销一步*/
		undo : {
			title : "向后撤销一步"
		},
		
		/*撤销一步*/
		redo : {
			title : "向前撤销一步"
		},
		
		/*
		 * 插入图片。
		 * 过程比较复杂，大致包括如下步骤：
		 * 0、弹窗，以下的步骤都在弹窗内完成
		 * 1、插入之前上传的图片
		 * 2、上传新的图片。html5异步上传图片，显示进度条
		 */
		insertImg : {
			title : "上传图片",
			init : function(editor, button){
				var dialogBody = 
					$('<div class="upload_dialog">'+
						'<div class="image_upload_area"><ul class="images"></ul></div>'+
						'<div class="upload_tool">'+
							'<div class="upload_process">'+
								'<div class="process_bar">'+
									'<span class="file_info"></span>'+
									'<span class="upload_status"></span>'+
								'</div>'+
							'</div>'+
							'<input type="file" accept="image/*"/>'+
							'<button class="select_file">选择新图片</button>'+
							'<button class="do_upload">上传新图片</button>'+
						'</div>'+
					'</div>');
				
				var drop 	= dialogBody.children(".image_upload_area"),
					imgs 	= drop.children(".images"),
					set 	= editor.setting.insertImg,
					tool 	= dialogBody.children(".upload_tool"),
					process = tool.find(".process_bar"),
					totalSize = 0,
					fileNum = 0,
					fileInput = tool.children("input");
				
				dialogBody.on("mousedown", function(){
					return false;
				});
				
				drop.on("dragenter", function(e){
					e.stopPropagation();
					e.preventDefault();
					drop.addClass("drop");
				}).on("dragleave dragend drop", function(e){
					e.stopPropagation();
					e.preventDefault();
					drop.removeClass("drop");
				}).on("dragover", function(e){
					e.stopPropagation();
					e.preventDefault();
				}).on("drop", function(e) {
					var files = e.originalEvent.dataTransfer.files;
					if(totalSize == 0){
						process.css("width", 0).children().html("");
					}
					$.each(files, function(i, f){
						addImg(f);
					});
				});
				
				function addImg(f){
					var type = f.type;
					if(type.indexOf("image") > -1){
						var reader = new FileReader();
						reader.onload = function(e) {
							var img = 
								$('<li class="new">'+
									'<div class="delete" title="删除">×</div>'+
									'<div class="img"><img src="'+this.result+'"/></div>'+
									'<div class="img_name" title="'+f.name+'">'+f.name+'</div>'+
								'</li>');
							
							imgs.prepend(img.data("file", f));
							totalSize += f.size;
							fileNum += 1;
							refresh();
						};
						reader.readAsDataURL(f);
					}
				}
				
				function renderImg(data){
					imgs.children(".new").remove();
					$.each(data, function(i, img){
						imgs.prepend($('<li>'+
							'<div class="delete" title="删除">×</div>'+
							'<div class="img"><img src="'+img.src+'"/></div>'+
							'<div class="img_name" title="'+img.name+'">'+img.name+'</div>'+
						'</li>').data("data", img));
					});
				}
				
				function refresh(){
					process.find(".file_info").html(fileNum+" 张新图片，共 " + Math.floor(totalSize/(1024*1024))+" MB");
				}
				
				fileInput.change(function(){
					var file = fileInput[0].files[0];
					if(file != null && file.type.indexOf("image") > -1){
						addImg(file);
					}
				});
				
				/*选择文件*/
				tool.children(".select_file").click(function(){
					fileInput.click();
				});
				
				/*确定按钮*/
				tool.children(".do_upload").click(function(){
					var files = imgs.find(".new");
					
					if(files.length > 0){
						var fd = new FormData(), f;
						$.each(files, function(i, img){
							f = $(img).data("file");
							fd.append("imgs", f);
						});
						
						var xhr = new XMLHttpRequest();
						xhr.upload.addEventListener("progress", function(e){
							process.css("width", (e.loaded * 100 / e.total)+"%");
						}, false);
						
						$.ajax({
							url : set.uploadUrl,
							data : fd,
							processData: false,
							contentType: false,
							type : "post",
							dataType : "json",
							xhr : function(){return xhr;},
							success : function(d){
								
								data = set.imgDataFilter(d);
								process.children(".upload_status").html("- (成功上传"+ data.length +"张图片)");
								/*以返回的图片为准进行渲染*/
								renderImg(data);
								
								fileNum = 0;
								totalSize = 0;
							}
						});
					}
				});
				
				/*插入图片*/
				imgs.delegate("img", "click", function(){
					if(!$(this).parents("li:first").is(".new")){
						editor.insertTxt("\n![Alt text]("+$(this).attr("src")+")");
					}
				}).delegate(".delete", "click", function(){
					var p = $(this).parent();
					if(p.is(".new")){
						var f = p.data("file");
						totalSize -= f.size;
						fileNum -= 1;
						refresh();
						p.remove();
					} else if(set.deleteUrl){
						$.ajax({
							url : set.deleteUrl,
							data : p.data("data"),
							type : "post",
							dataType : "json",
							data : p.data("data"),
							success : function(){
								p.remove();
							}
						});
					}
				});
				
				/*创建对话框*/
				var dialog = new MintDialog({
						title:"<span style='font-family:微软雅黑;'>上传文件（把文件拖到虚线框内上传）</span>",
						body: dialogBody,
						modal:false,
						moveable:true,
						beforeClose:function(){
							return true;
						},
						onShow : function(){
							if(dialog.FIRST && set.loadUrl){
								$.ajax({
									url : set.loadUrl+"?"+new Date().getTime(),
									type:"get",
									success : function(data){
										dialog.FIRST = false;
										data = set.imgDataFilter(data);
										renderImg(data);
									}
								});
							}
						}
					});
				dialog.FIRST = true;
				
				button.data("dialog", dialog);
			},
			
			fn : function(editor, button, e){
				button.data("dialog").show();
			},
		},
		
		preview : {
			title : '预览',
			init : function(editor, button, e){
				if(editor.prevOn){
					button.addClass("active");
					editor.tool.addClass("preview_on");
				}
			},
			fn : function(editor, button, e){
				if(editor.body.is(".preview_on")){
					editor.body.removeClass("preview_on");
					button.removeClass("active");
					editor.tool.removeClass("preview_on");
					editor.prevOn = false;
				} else {
					editor.body.addClass("preview_on");
					button.addClass("active");
					editor.tool.addClass("preview_on");
					editor.prevOn = true;
					editor.prev();
				}
			}
		},

		leftRight : {
			title : "左右布局",
			init : function(editor, button){
				button.addClass("active");
			},
			fn : function(editor, button, e){
				editor.body.removeClass("left_right");
				button.addClass("active").parent().find(".rightLeft").removeClass("active");
			}
		},
		
		rightLeft : {
			title : "右左布局",
			init : $.noop,
			fn : function(editor, button, e){
				editor.body.addClass("left_right");
				button.addClass("active").parent().find(".leftRight").removeClass("active");
			}
		}
	}
}