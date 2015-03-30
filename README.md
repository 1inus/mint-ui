#site & doc & usage & live demo
[mint-ui](http://mint-ui.wemakers.net/)
#blog
[makerblog](http://www.wemakers.net/home/blog?cate=1002)
# mint-ui
a suite of jquery web plugin.include imgcut,dialog, form validator, markdowneditor, rich text editor.
##dialog
###screenshot
![jquery dialog](http://mint-ui.wemakers.net/imgs/dialog.png)
###usage
```html
<meta charset="utf-8">
<title>dialog demo</title>
<button onclick="dia1.show();">模态弹窗</button>
<button onclick="dia2.show();">非模态弹窗</button>
<script src="../lib/jquery-1.8.3.min.js"></script>
<script src="MintDialog.js"></script>
<script>
	var dia1 = new MintDialog({
		title : "modal",
		body : "hello friends"
	});
	
	var dia2 = new MintDialog({
		title : "moveable",
		body : "hello friends",
		modal:false,
		moveable:true
	});
</script>
```
##imgcut
###screenshot
![jquery imgcut](http://mint-ui.wemakers.net/imgs/imgselect.png)
###usage
```html
<title>图片剪切</title>
<meta charset="UTF-8"/>
<style>
	html,body{padding:0;margin:0;}
	#img{max-height:400px;max-width:400px;margin:10px;margin-right:0;}
	.previews{text-align:center;}
	.preview{display:inline-block;border:2px solid #ccc;margin-bottom:10px;}
	.preview1{width:50px;height:50px;}
	.preview2{width:80px;height:80px;}
	.preview3{width:120px;height:120px;}
</style>
<table>
	<tr>
		<td><img id="img" src="45.jpg"/></td>
		<td>
			<div class="previews">
				<div class="preview1 preview"></div>
				<div class="preview2 preview"></div>
				<div class="preview3 preview"></div>
			</div>
		</td>
	</tr>
</table>
<script src="../lib/jquery-1.8.3.min.js"></script>
<script src="imageSelect.min.js"></script>
<script>
	var setting = {
		scope : {
			top : 100,
			left : 100,
			width : 300,
			height : 300
		},
		ratio:1,
		preview:".preview",
		onSelect : function(pane, img){},
		onEnd : function(a,b){console.log(JSON.stringify(b));}
	}
	
	$("#img").MintImgSelect(setting);

	$("#change").click(function(){
		$("#img").attr("src", "demo.jpg");
	});
</script>
```
##form validator
###screenshot
![jquery validator](http://mint-ui.wemakers.net/static/doc/d24486666fe24ee8a3f2ef54a0f95e3d.png)
###usage
```html
<title>表单验证插件</title>
<meta charset=UTF-8>
<style>
	html{background:#8B817D;}
	form{position:absolute;	top:50%;left:50%;margin-left:-225px;margin-top:-206px;width:480px;background:#fff;
		box-shadow: 0 0 80px rgba(214, 214, 214, 0.6);}
	*{outline:none;font-family: "微软雅黑";color:#7777777;}
	form dt{width:80px;float:left;line-height:30px;text-align:right;}
	form dt,form dd{padding:5px 3px;}
	input{border:1px solid #9EC3FF;padding:4px 6px;font-size:16px;width:200px;}
	input:focus{border-color:#4D90FE!important;box-shadow: 0 0 10px rgba(74, 168, 255, 0.5);}
	input:hover{border-color:#4D90FE;}
	button{width:200px;padding:4px 6px;font-size:18px;box-sizing:content-box;color:#fff;border:none;background:#93BEFF;}
</style>
<form id="registerForm">
	<dl>
		<dt>昵称：</dt><dd><input type="text" name="nickname"/></dd>
		<dt>邮件：</dt><dd><input type="text" name="email"/></dd>
		<dt>密码：</dt><dd><input type="password" name="pwd"/></dd>
		<dt>确认：</dt><dd><input type="password" name="pwd1"/></dd>
		<dt></dt><dd><button type="button" id="register">注&emsp;册</button></dd>
	</dl>
</form>
<script src="../lib/jquery-1.8.3.min.js"></script>
<script src="MintValidator.min.js"></script>
<script>
	/*先定义验证规则*/
	var rules = {
		"email"    	: {
			"rule" : /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
			"tip" : "邮箱格式不对"
		},
		"eq"		: {
			"rule" : function(val, formData){ return val == formData.pwd; },
			"tip" : "密码不匹配"
		},
		"notnull" : {
			"rule" : function(val, formData){return !(val == "")},
			"tip" : "不要为空"
		}
	};
	
	/*配置所有需要验证的表单域的验证参数*/
	var inputs = [{ 
			name 		: "nickname", 	//表单域的name属性值
			rules 		: ['notnull'], 	//采用什么规则验证此输入框，可配置多个规则
			focusMsg 	: '不能为空',	//当表单域获得焦点时的提示信息
			rightMsg	: '昵称可用(^_^)', //当表单域验证成功时的提示信息
			errorMsg	: "请输入昵称",	//当表单验证不成功时的提示信息
			
			/*定义ajax验证参数，结合后台验证昵称*/
			ajax 		: {
				url 	: "account/confirm_nickname",
				dataType:"json",
				filter 	: function(data){
					if(data.result){
						data.msg = "昵称可以注册(^_^)";
					} else if(d.data > 0){
						data.msg = "此昵称已被占用(^_^)||";
					}
					return data;
				}
			}
		},{ 
			name 		: "pwd",	
			rules 		: ['notnull'],
			focusMsg 	: '登陆密码',
			rightMsg 	: "密码有效(^_^)"
		},{ 
			name 		: "pwd1",	
			rules 		: ['eq'],		
			focusMsg 	: '确认密码',	
			rightMsg 	: "密码匹配(^_^)",
		},{ 
			name 		: "email",
			rules 		: ["email"],	
			focusMsg 	: '常用邮箱',
			rightMsg 	: "邮箱有效(^_^)"
		}
	];
	
	var setting = {
			inputs				: inputs,
			submitButton 		: "#register",
			rules 				: rules,
			showTipsAfterInit 	: true,
			onSubmit 			: function(result, button, form){
				if(result){
					//如果表单的验证结果为true,则可以手动通过ajax提交表单
				}
			}
		}
	
	/*最终验证表单*/
	$("#registerForm").validateForm(setting);
</script>
```
##rich text editor
###screenshot
![rich text editor](http://mint-ui.wemakers.net/static/doc/2d7e9ba2e18149a6910463671a4e1315.png)
###usage
```html
<meta charset="utf-8">
<title></title>
<style>
	body{position:absolute;	left:20px;right:20px;bottom:20px;top:70px;}
	#toolbar{border:1px solid #ccc;position:absolute;bottom:100%;left:0;right:0;}
	#editorBody{position:absolute;z-index:1;top:4px;bottom:0;left:0;right:0;border:1px solid #ccc;}
</style>
<div id="toolbar"></div>
<div id="editorBody">
<h2>特点</h2>
<p>MintEditor是一款轻巧的富文本编辑器。工具栏和编辑区域可分开，方便与多种布局融合。开发者友好，易于扩展</p>
<h2>为什么要开发这个插件</h2>
<p>原因主要是因为作者在用其他编辑器编写博客时，每插入一张图片就要上传一次，而且图片不小心被删除了就找不回来了，得重新上传。所以我希望能有个能管理当前博客所有图片的编辑器，我可以在博客中随时插入和删除图片，但是我找了很久都没找着。偶然间，发现开发个简单的编辑器也并不难，所以就自己开发了一个。</p>
</div>
<script src="../lib/jquery-1.8.3.min.js"></script>
<script src="../MintDialog/MintDialog.min.js"></script>
<script src="MintEditor.js"></script>
<script>
	/*tools can be null*/
	var tools = [
			"undo", "redo", "removeFormat", "|", 
			"bold", "italic", "underline", "strikeThrough", "|",
			"justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "|", 
			"indent", "outdent", "|",
			"insertUnorderedList", "insertOrderedList", "quote", "cancelQuote", "lang", "superscript", "subscript", "createLink", "unlink", "|", 
			"head", "fontSize", "fontName", "foreColor", "|",
			"insertImg"
		];
	
	var toolSetting = {
			insertImg : {
				uploadUrl : "docadmin/imgs", //上传文件的url
				loadUrl : "docadmin/imgs",	//获取图片的url
				deleteUrl : "docadmin/imgs/delete",//删除图片的url
				
				/*
				 * 根据loadUrl获取到数据后交给此回调函数处理，
				 * 请返回包含文件的路径和文件名对象数组
				 * 如：[{
				 * 		name : "img.jpg",
				 * 		src : "http://localhost/imgs/img.jpg"
				 * }]
				 */
				imgDataFilter : function(data){
					var d = [];
					$.each(data.data, function(i, t){
						d.push({
							name : t.name,
							src : "static/doc/"+t.fileName,
							id : t.id
						});
					});
					return d;
				}
			}
		}
	var editor = new MintEditor("#toolbar", "#editorBody", tools, toolSetting);
	console.log(editor.html());
	console.log(editor.getCatalogue());
</script>
```
##markdown editor
###screenshot
![markdown editor](http://mint-ui.wemakers.net/static/doc/eb08196e6fac4b49acd586c9be4bdd01.png)
###usage
```html
<title>mint</title>
<meta charset="utf-8"/>
<style>
	body{position:absolute;top:50px;left:50px;right:50px;bottom:20px;}
	.toolbar{position:absolute;z-index:1;bottom:100%;width:100%;}
	.editor{width:100%;position:absolute;bottom:0;top:-2px;}
</style>
<div class="toolbar"></div>
<div class="editor">##特点
MintMarkdown是一款轻巧的富文本编辑器。工具栏和编辑区域可分开，方便与多种布局融合。采用<a href="https://github.com/chjj/marked">marked</a>将markdown语法转换成html。预览效果采用<a href="https://highlightjs.org/">highlight</a>代码块语法高亮。
MintMarkdown非常简单，开发者友好，易于扩展 

##为什么要开发这个插件
原因主要是因为作者在用其他编辑器编写博客时，每插入一张图片就要上传一次，而且图片不小心被删除了就找不回来了，得重新上传。所以我希望能有个能管理当前博客所有图片的编辑器，我可以在博客中随时插入和删除图片，但是我找了很久都没找着。所以就自己开发了一个</div>
<script src="../lib/jquery-1.8.3.min.js"></script>
<script src="../MintDialog/MintDialog.min.js"></script>
<script src="MintMarkdown.js"></script>
<script>
	/*tools can be null*/
	var tools = ["undo", "redo", "|", "insertImg", "preview", "leftRight", "rightLeft"];
	var buttonSetting = {
			insertImg : {
				uploadUrl : "docadmin/imgs", //上传文件的url
				loadUrl : "docadmin/imgs",	//获取图片的url
				deleteUrl : "docadmin/imgs/delete",
				/*
				 * 根据loadUrl获取到数据后交给此函数处理，请返回文件的路径和文件名对象数组
				 * 如：[{
				 * 		name : "img.jpg",
				 * 		src : "http://localhost/imgs/img.jpg"
				 * }]
				 */
				imgDataFilter : function(data){
					var d = [];
					$.each(data.data, function(i, t){
						d.push({
							name : t.name,
							src : "static/doc/"+t.fileName,
							id : t.id
						});
					});
					return d;
				}
			}
		};
	
	var previewOn = true;
	var editor = new MintMarkdown(".toolbar", ".editor", tools, buttonSetting, previewOn);
	
	editor.text("new content");
	var html = editor.html();
	var text = editor.text();
	var catalogue = editor.getCatalogue();
</script>
```
