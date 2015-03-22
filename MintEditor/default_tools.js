	/*工具栏的工具配置*/
	var TOOLS = {
		/*撤销一步*/
		undo : {
			title : "向后撤销一步",
			fn : function(){
				document.execCommand("undo", false, null);
				saveScene();
			}
		},
		
		/*撤销一步*/
		redo : {
			title : "向前撤销一步",
			fn : function(){
				document.execCommand("redo", false, null);
				saveScene();
			}
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
			fn : function(){
				var br = TXT ? TXT : "<br/>";
				insertHtml('<blockquote class="quote">'+br+'</blockquote>');
			}
		},
		
		/*插入代码*/
		lang : {
			title : "添加代码",
			init : function(btn){
				var langs = $('<ul class="drop_down_box" tabindex=-1>'+
								'<li>html</li>'+
								'<li>javascript</li>'+
								'<li>java</li>'+
								'<li>phyon</li>'+
								'<li>ruby</li>'+
								'<li>shell</li>'+
								'<li>sql</li>'+
								'<li>php</li>'+
							'</ul>');
				btn.append(langs);
				
				langs.delegate("li", "click", function(e){
					var l = $(this).html();
					insertHtml('<pre class="'+l+'" title="'+l+'代码"><br/></pre>');
					langs.blur();
				});
			},
			fn : function(CTX, btn, e){
				btn.children("ul").slideDown("fast").focus();
			}
		},
		
		cancelQuote : {
			title : "取消引用",
			fn : function(){
				excu("outdent", false, null);
			}
		},
		
		head : {
			title : "标题样式",
			init : function(btn){
				var hs = '<span class="tool" unselectable="on">正文与标题</span>'+
						'<ul class="drop_down_box font_size_values" tabIndex="-1" onclick="$(this).blur();">'+
							'<li op="fb-p">正文</li>'+
							'<li op="fb-h1"><h1>h1</h1></li>'+
							'<li op="fb-h2"><h2>h2</h2></li>'+
							'<li op="fb-h3"><h3>h3</h3></li>'+
							'<li op="fb-h4"><h4>h4</h4></li>'+
							'<li op="fb-h5"><h5>h5</h5></li>'+
							'<li op="fb-h6"><h6>h6</h6></li>'+
						'</ul>';
				
				btn.html(hs);
			},
			fn : function(CTX, btn, e){
				btn.children("ul").slideDown("fast").focus();
			}
		},
		
		fontSize : {
			title : "字号",
			init : function(btn){
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
					
				btn.append(vals);
			},
			fn : function(CTX, btn, e){
				btn.children("ul").slideDown("fast").focus();
			}
		},
		
		fontName : {
			title : "字体",
			init : function(btn){
				var vals = '<span class="tool" unselectable="on">字体</span>'+
							'<ul class="drop_down_box font_family_values" tabIndex="-1" onclick="$(this).blur()">'+
								'<li op="FontName" val="宋体" style="font-family: \'宋体\';">宋体</li>'+
								'<li op="FontName" val="微软雅黑" style="font-family: \'微软雅黑\';">微软雅黑</li>'+
								'<li op="FontName" val="arial" style="font-family: \'arial\';">arial</li>'+
								'<li op="FontName" val="" style="font-family: \'arial black\';">arial black</li>'+
							'</ul>';
				
				btn.append(vals);
			},
			fn : function(CTX, btn, e){
				btn.children("ul").slideDown("fast").focus();
			}
		},
		
		foreColor : {
			title : "字体颜色",
			init : function(btn){
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
							
				btn.append(vals);
			},
			fn : function(CTX, btn, e){
				btn.children("ul").slideDown("fast").focus();
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
			init : function(btn){
				var dialogBody = 
					$('<div class="upload_dialog">'+
						'<ul class="image_upload_area">'+
							'<li>'+
								'<div class="img"><img src="../../imgs/01.jpg"/></div>'+
								'<div class="img_name" title="01.jpg">01.jpg</div>'+
							'</li>'+
						'</ul>'+
						'<div class="upload_tool"><button class="cancel_upload">取消</button><button class="do_upload">上传</button></div>'+
					'</div>');
				
				var imgs = dialogBody.children(".image_upload_area");
				
				imgs.on("dragenter", function(e){
					e.stopPropagation();
					e.preventDefault();
					imgs.addClass("drop");
				}).on("dragleave dragend drop", function(e){
					e.stopPropagation();
					e.preventDefault();
					imgs.removeClass("drop");
				}).on("dragover", function(e){
					e.stopPropagation();
					e.preventDefault();
				}).on("drop", function(e) {
					var files = event.dataTransfer.files;
					
					var img, type, reader;
					$.each(files, function(i, f){
						type = f.type;
						if(type.indexOf("image") > -1){
							reader = new FileReader();
							reader.onload = function(e) {
								img = 
									'<li class="new">'+
										'<div class="img"><img src="$url"/></div>'+
										'<div class="img_name" title="$name">$name</div>'+
									'</li>';
								
								img = $(img.replace("$url", this.result).replace("$name", f.name).replace("$name", f.name)).data("file", f);
								
								imgs.append(img);
							};
							reader.readAsDataURL(f);
						}
					});
				});
				
				/*确定按钮*/
				dialogBody.children(".upload_tool").children(".do_upload").click(function(){
					var files = imgs.find(".new");
					
					var fd = new FormData(), f;
					$.each(files, function(i, img){
						f = $(img).data("file");
						fd.append("imgs", f);
					});
					
					var xhr = new XMLHttpRequest();
					xhr.open('post', '../../upload');
					xhr.send(fd);
				});
				
				/*插入图片*/
				imgs.delegate("img", "click", function(){
					excu("insertImage", false, $(this).attr("src"));
				});
				
				/*创建对话框*/
				var dialog = $().dialog({
						title:"<span style='font-family:微软雅黑;'>上传文件（把文件拖到虚线框内上传）</span>",
						content: dialogBody,
						beforeClose:function(){
							return true;
						}
					});
				
				btn.data("dialog", dialog);
			},
			
			fn : function(CTX, btn, e){
				btn.data("dialog").show();
			}
		},
		
		/*创建链接*/
		createLink : {
			title : "创建链接",
			init : function(btn){
				var dialog = 
					$('<div class="drop_down_box" tabindex=-1>'+
						'<form class="link_argument">'+
							'<span>链接地址：</span><input class="url" value="http://" autocomplated="off"/><br/>'+
							'<span>链接文字：</span><input class="txt" value="" autocomplated="off"/><br/>'+
							'<span>本页打开：</span><input name="tar" value="_blank" type="radio" checked autocomplated="off"/><br/>'+
							'<span>新页打开：</span><input name="tar" value="_parent" type="radio" autocomplated="off"/><br/>'+
						'</form>'+
						'<button class="done">确定</button>'+
						'<button class="cancel">取消</button>'+
					'</div>');
				
				var inputs = dialog.children(".link_argument");
				dialog.delegate("button", "click", function(){
					if($(this).is(".done")){
						var url = inputs.children(".url").val(),
							txt = inputs.children(".txt").val();
						
						if(url && txt){
							insertHtml('<a href="url" target="$tar">txt</a>'.
								replace("url", url).
								replace("txt", txt).
								replace("$tar", inputs.children("[name=tar]:checked").val()));
						}
						
					}
					$(this).blur();
				});
				
				btn.append(dialog);
			},
			
			fn : function(CTX, btn, e){
				btn.children(".drop_down_box").slideDown("fast").focus().
					find(".link_argument>.txt").val(TXT);
			}
		},
		
		unlink : {
			title : "取消链接"
		}
	};