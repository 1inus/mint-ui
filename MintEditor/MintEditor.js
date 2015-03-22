/*自动加载css*/
(function(){
	var path = $("script").last().attr("src");
	//样式统一放在css下，统一命名为style.css
	$("head:first").append(
		$('<link rel="stylesheet"/>').
		attr("href", path.replace(path.substring(path.lastIndexOf("/")+1), "css/style.css"))
	).append($('<link rel="stylesheet"/>').
		attr("href", path.replace(path.substring(path.lastIndexOf("/")+1), "css/article.css")));
})();

/**
 * 富文本编辑器
 * @param tool 工具栏容器
 * @param body 编辑区域容器
 * @param tools 自定义工具栏。为空时默认显示所有支持的工具
 */
function MintEditor(tool, body, tools, setting){
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
		
	/*编辑器工具栏*/
	thiz.tool = $('<ul class="mint_editor_toolbar"/>').appendTo($($(tool)[0]));
	
	/*初始化编辑空间*/
	var b =  $($(body)[0]);
	/*编辑器主体*/
	thiz.body = $('<div class="mint_editor_body article" spellcheck="false" contenteditable></div>').html(b.html());
	
	/*
	 * wrap 的作用很特殊，在某些情况下，虽然光标或者选区在editor_body内，
	 * 但是获取得的parentNode（parentElement）却显示
	 * parentNode是editor_body的父元素。暂时发现两种这种情况：
	 * 编辑器内没有任何内容时；光标停在编辑器中纯文本内容时。
	 */
	thiz.wrap = $('<div class="mint_editor_body_wraper">').append(thiz.body).appendTo(b.empty());
	
	/*保存选区现场*/
	thiz.body.on("mouseup keyup mouseleave", function(e){
		thiz.saveScene();
	});
	
	thiz.SEL = thiz.RG = thiz.BKM = thiz.TXT = null;
	
	/*监听头部*/
	thiz.tool.delegate("li", "click", function(e){
		var button = $(this);
		var op = button.attr("op");
		var fn = button.attr("fn");
		var val = button.attr("val");
		
		if(op){
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
	}).delegate(".drop_down_box", "blur focus", function(e){
		/*如果是内部元素获得焦点，不能视为失去焦点，blur=0表示未失去焦点*/
		var t = $(this);
		if(e.type == "focusout") {
			t.removeData("blur");
			setTimeout(function(){
				if(!(t.data("blur") == '0')) {
					t.slideUp("fast");
					t.removeData("blur");
				}
			}, 5);
		} else {
			t.data("blur", 0);
		}
	});
	
	if(!tools){
		tools = [
			"undo", "redo", "removeFormat", "|", 
			"bold", "italic", "underline", "strikeThrough", "|",
			"justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "|", 
			"indent", "outdent", "|",
			"insertUnorderedList", "insertOrderedList", "pasteMode", "createLink", "unlink", "quote", "cancelQuote", "lang", "superscript", "subscript", "|", 
			"head", "fontSize", "fontName", "foreColor", "|",
			"insertImg"
		];
	}
	
	/*初始化工具栏*/
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
};

/**/
MintEditor.prototype = {
	/*
	 * 获得编辑器的内容
	 */
	html : function(html){
		var thiz = this;
		if(html != undefined){
			thiz.body.html(html);
		} else {
			/*为标题添加锚点*/
			thiz.initHeadAnchor();
			return thiz.body.html().trim();
		}
	},
	 
	/*获取文章的目录*/
	getCatalogue : function(){
		/*为标题添加锚点*/
		this.initHeadAnchor();

		/*前端生成目录*/
		var hs = this.body.find("h1,h2,h3,h4,h5,h6,h7").clone();
		
		hs.each(function(i, t){
			t = $(t);
			t.attr("for", t.attr("id")).removeAttr("id");
		});
		
		return $("<div/>").append(hs).html().trim();
	},
	
	/*初始化标题的锚点（加上id属性）*/
	initHeadAnchor : function(){
		this.body.find("h1,h2,h3,h4,h5,h6,h7").each(function(i,t){
			t = $(t);
			if(!t.attr("id")){
				t.attr("id", "h"+Math.floor(Math.random()*100000));
			}
		});
	},
	
	/*
	 * 提示信息，在编辑框的头部显示
	 * state有3个取值
	 * success、fail、waring
	 */
	tip : function (msg, state){
		
	},
	
	mask : function (msg){
		
	},
	
	/*
	 * 执行编辑命令
	 */
	exeCmd : function(cmd, asdu, argument) {
		var thiz=this;
		if(thiz.RG){
			thiz.restoreScene();
			document.execCommand(cmd, asdu, argument);
			thiz.saveScene();
		}
	},
	
	/*插入html标签，为了兼容ie而做*/
	/*插入html的做法。为兼容ie*/
	insertHtml : function(html){
		var thiz = this;
		if(thiz.RG){
			thiz.restoreScene();
			try{ // w3c
				thiz.exeCmd("inserthtml", false, html);
				thiz.RG.collapse(false);
			} catch(e){
				try{
					thiz.RG.pasteHTML(html); // < ie9
				} catch(e){ // >= ie9
					thiz.RG.deleteContents();
					thiz.RG.insertNode($(html)[0]);
					thiz.RG.collapse(true);
				}
			}
			
			thiz.saveScene();
			thiz.body.focus();
		}
	},
	
	/*恢复选区现场*/
	restoreScene : function(){
		var thiz = this;
		if(thiz.RG){
			if(thiz.SEL.addRange){
				thiz.SEL.removeAllRanges();
				thiz.SEL.addRange(thiz.RG);
			} else {
				thiz.RG.moveToBookmark(thiz.BKM);
				thiz.RG.select();
			}
		}
	},
	
	/*
	 * 保存选区现场
	 * 编辑框失去焦点时的选区现场
	 */
	saveScene : function(){
		/*获取光标或者选区*/
		var sel, rg, pe, thiz = this;
		if(window.getSelection){ //w3c
			sel = window.getSelection();
			if(sel.rangeCount){
				rg = sel.getRangeAt(0).cloneRange();
				pe = rg.commonAncestorContainer.parentNode;
			}
		} else { // < ie9
			sel = document.selection;
			rg = sel.createRange();
			pe = rg.parentElement();
		}
		
		/*判断光标是否在编辑区域*/
		if(pe){
			var result = false;
			if(thiz.wrap[0].contains){
				result = thiz.wrap[0].contains(pe);
			} else {
				result = thiz.wrap[0].compareDocumentPosition(pe);
				if(result == 0) {
					result = true;
				} else {
					(result & 16) ? result = true : result = false;
				}
			}
			
			/*如果*/
			if(result){
				thiz.SEL = sel;
				thiz.RG = rg;
				
				if(rg.getBookmark){
					thiz.BKM = rg.getBookmark();
					thiz.TXT = rg.text;
				} else {
					thiz.TXT = thiz.SEL.toString();
				}
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
		
		removeFormat : {
			title :"清除格式"
		},
		
		/*粗体*/
		bold : {
			title : "粗体"
		},
		
		/*斜体*/
		italic : {
			title : "斜体"
		},
		
		/*下划线*/
		underline : {
			title : "下划线"
		},
		
		/*删除线*/
		strikeThrough : {
			title : "删除线"
		},
		
		/*靠左对齐*/
		justifyLeft : {
			title : "靠左对齐"
		},
		
		/*居中对齐*/
		justifyCenter : {
			title : "居中对齐"
		},
		
		/*靠右对齐*/
		justifyRight : {
			title : "靠右对齐"
		},
		
		/*两端对齐*/
		justifyFull : {
			title : "两端对齐"
		},
		
		/*增加缩进*/
		indent : {
			title : "增加缩进"
		},
		
		/*减少缩进*/
		outdent : {
			title : "减少缩进"
		},
		
		superscript : {
			title : "上标"
		},
		
		subscript : {
			title : "下标"
		},
		
		insertUnorderedList : {
			title : "无序列表"
		},
		
		insertOrderedList : {
			title : "有序列表"
		},
		/*以下是插入操作。以isFB标志，FB是formatBlock之意。*/
		
		/*插引用*/
		quote : {
			title : "引用",
			fn : function(editor){
				var br = editor.TXT ? editor.TXT : "<br/>";
				editor.insertHtml('<blockquote class="quote">'+br+'</blockquote>');
			}
		},
		
		/*插入代码*/
		lang : {
			title : "添加代码",
			init : function(editor, button){
				var langs = $('<ul class="drop_down_box" tabindex=-1>'+
								'<li>html</li>'+
								'<li>xml</li>'+
								'<li>css</li>'+
								'<li>javascript</li>'+
								'<li>java</li>'+
								'<li>c</li>'+
								'<li>c#</li>'+
								'<li>phyon</li>'+
								'<li>ruby</li>'+
								'<li>shell</li>'+
								'<li>sql</li>'+
								'<li>php</li>'+
							'</ul>');
				button.append(langs);
				
				langs.delegate("li", "click", function(e){
					var l = $(this).html();
					editor.insertHtml('<pre class="'+l+'"><br/></pre>');
					langs.blur();
				});
			},
			fn : function(editor, button, e){
				button.children("ul").slideDown("fast").focus();
			}
		},
		
		cancelQuote : {
			title : "取消引用",
			fn : function(editor){
				editor.exeCmd("outdent", false, null);
			}
		},
		
		head : {
			title : "标题样式",
			init : function(editor, button){
				var hs = '<span class="tool" unselectable="on">格式</span>'+
						'<ul class="drop_down_box font_size_values" tabIndex="-1" onclick="$(this).blur();">'+
							'<li op="fb-p">正文</li>'+
							'<li op="fb-h1"><h1>h1</h1></li>'+
							'<li op="fb-h2"><h2>h2</h2></li>'+
							'<li op="fb-h3"><h3>h3</h3></li>'+
							'<li op="fb-h4"><h4>h4</h4></li>'+
							'<li op="fb-h5"><h5>h5</h5></li>'+
							'<li op="fb-h6"><h6>h6</h6></li>'+
						'</ul>';
				
				button.html(hs);
			},
			fn : function(editor, button, e){
				button.children("ul").slideDown("fast").focus();
			}
		},
		
		fontSize : {
			title : "字号",
			init : function(editor, button){
				var vals = '<span class="tool" unselectable="on">字号</span>'+
							'<ul class="drop_down_box h_values" tabIndex="-1" onclick="$(this).blur();">'+
								'<li op="FontSize" style="font-size:10px;" val="1">1号</li>'+
								'<li op="FontSize" style="font-size:12px;" val="2">2号</li>'+
								'<li op="FontSize" style="font-size:14px;" val="3">3号</li>'+
								'<li op="FontSize" style="font-size:16px;" val="4">4号</li>'+
								'<li op="FontSize" style="font-size:18px;" val="5">5号</li>'+
								'<li op="FontSize" style="font-size:20px;" val="6">6号</li>'+
								'<li op="FontSize" style="font-size:22px;" val="7">7号</li>'+
							'</ul>';
					
				button.append(vals);
			},
			fn : function(editor, button, e){
				button.children("ul").slideDown("fast").focus();
			}
		},
		
		fontName : {
			title : "字体",
			init : function(editor, button){
				var vals = '<span class="tool" unselectable="on">字体</span>'+
							'<ul class="drop_down_box font_family_values" tabIndex="-1" onclick="$(this).blur()">'+
								'<li op="FontName" val="宋体" style="font-family:宋体;">宋体</li>'+
								'<li op="FontName" val="微软雅黑" style="font-family: 微软雅黑;">微软雅黑</li>'+
								'<li op="FontName" val="arial" style="font-family:arial;">arial</li>'+
								'<li op="FontName" val="" style="font-family:\'arial black\';">arial black</li>'+
							'</ul>';
				
				button.append(vals);
			},
			fn : function(editor, button, e){
				button.children("ul").slideDown("fast").focus();
			}
		},
		
		/*粘贴模式*/
		pasteMode : {
			title : "粘贴模式",
			init : function(editor, button){
				/*
				 * 粘贴模式说明：
				 * 0:样式和文字
				 * 1:仅文字
				 */
				editor.pasteMode = 0;
				
				editor.body.on("paste", function(e){
					e = e.originalEvent;
					
					if(editor.pasteMode){
						e.preventDefault();
						editor.insertHtml(e.clipboardData.getData("text/plain"));
					}
				});
				
				button.click(function(){
					var t = $(this);
					if(t.is(".active")){
						t.removeClass("active");
						editor.pasteMode = 0;
					} else {
						t.addClass("active");
						editor.pasteMode = 1;
					}
				});
			}
		},
		
		foreColor : {
			title : "字体颜色",
			init : function(editor, button){
				var vals =$( 
					'<span class="tool" unselectable="on">字体颜色</span>'+
					'<ul class="drop_down_box font_color_values" tabIndex="-1" onclick="$(this).blur()">'+
						'<li op="foreColor" style="background:#FFF;" val="#FFF"></li>'+
						'<li op="foreColor" style="background:#000;" val="#000"></li>'+
						'<li op="foreColor" style="background:#9c9;" val="#9c9"></li>'+
						'<li op="foreColor" style="background:#f90;" val="#f90"></li>'+
						'<li op="foreColor" style="background:#09c;" val="#09c"></li>'+
						'<li op="foreColor" style="background:#369;" val="#369"></li>'+
						'<li op="foreColor" style="background:#c03;" val="#c03"></li>'+
						'<li op="foreColor" style="background:#f60;" val="#f60"></li>'+
						'<li op="foreColor" style="background:#6c0;" val="#6c0"></li>'+
						'<li op="foreColor" style="background:#9c3;" val="#9c3"></li>'+
						'<li op="foreColor" style="background:#393;" val="#393"></li>'+
						'<li op="foreColor" style="background:#69c;" val="#69c"></li>'+
						'<li op="foreColor" style="background:#c69;" val="#c69"></li>'+
						'<li op="foreColor" style="background:#696;" val="#696"></li>'+
						'<li op="foreColor" style="background:#6cf;" val="#6cf"></li>'+
						'<li op="foreColor" style="background:#99f;" val="#99f"></li>'+
						'<li op="foreColor" style="background:#969;" val="#969"></li>'+
						'<li op="foreColor" style="background:#636;" val="#636"></li>'+
						'<li op="foreColor" style="background:#cc9;" val="#cc9"></li>'+
						'<li op="foreColor" style="background:#669;" val="#669"></li>'+
						'<li op="foreColor" style="background:#cc3;" val="#cc3"></li>'+
						'<li op="foreColor" style="background:#09c;" val="#09c"></li>'+
						'<li op="foreColor" style="background:#366;" val="#366"></li>'+
						'<li op="foreColor" style="background:#666;" val="#666"></li>'+
						'<li op="foreColor" style="background:#999;" val="#999"></li>'+
					'</ul>');
							
				button.append(vals);
			},
			fn : function(editor, button, e){
				button.children("ul").slideDown("fast").focus();
			}
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
						editor.exeCmd("insertImage", false, $(this).attr("src"));
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
			}
		},
		
		/*创建链接*/
		createLink : {
			title : "创建链接",
			init : function(editor, button){
				var dialog = 
					$('<div class="drop_down_box" tabindex=-1>'+
						'<form class="link_argument">'+
							'<span>链接地址：</span><input class="url" value="http://" autocomplated="off"/><br/>'+
							'<span>链接文字：</span><input class="txt" value="" autocomplated="off"/><br/>'+
							'<span>本页打开：</span><input name="tar" value="_blank" type="radio" checked autocomplated="off"/><br/>'+
							'<span>新页打开：</span><input name="tar" value="_parent" type="radio" autocomplated="off"/><br/>'+
						'</form>'+
						'<button class="done" type="button">确定</button>'+
						'<button class="cancel" type="button">取消</button>'+
					'</div>');
				
				var inputs = dialog.children(".link_argument");
				dialog.delegate("button", "click", function(){
					if($(this).is(".done")){
						var url = inputs.children(".url").val(),
							txt = inputs.children(".txt").val();
						
						if(url && txt){
							editor.insertHtml('<a href="url" target="$tar">txt</a>'.
								replace("url", url).
								replace("txt", txt).
								replace("$tar", inputs.children("[name=tar]:checked").val()));
						}
						
					}
					$(this).blur();
				});
				
				button.append(dialog);
			},
			
			fn : function(editor, button, e){
				button.children(".drop_down_box").slideDown("fast").focus().
					find(".link_argument>.txt").val(editor.TXT);
			}
		},
		
		unlink : {
			title : "取消链接"
		}
	}
}