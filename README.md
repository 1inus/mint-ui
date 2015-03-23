# mint-ui
a suite of jquery web plugin.include imgcut,dialog, form validator, markdowneditor, rich text editor.
##dialog
![jquery dialog](http://mint-ui.wemakers.net/imgs/dialog.png)
usage
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
![jquery imgcut](http://mint-ui.wemakers.net/imgs/imgselect.png)

```html
<title>图片剪切</title>
<meta charset="UTF-8"/>
<style>
	html,body{
		padding:0;
		margin:0;
	}
	#img{
		max-height:400px;
		max-width:400px;
		margin:10px;
		margin-right:0;
	}
	.previews{
		text-align:center;
	}
	.preview{
		display:inline-block;
		border:2px solid #ccc;
		margin-bottom:10px;
	}
	
	.preview1{
		width:50px;
		height:50px;
	}
	
	.preview2{
		width:80px;
		height:80px;
	}
	
	.preview3{
		width:120px;
		height:120px;
	}
	
	.debug{
		margin:2px;
		border:solid 1px #ccc;
		font-weight:700;
	}
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
![jquery validator](http://mint-ui.wemakers.net/static/doc/d24486666fe24ee8a3f2ef54a0f95e3d.png)
##rich text editor
![rich text editor](http://mint-ui.wemakers.net/static/doc/2d7e9ba2e18149a6910463671a4e1315.png)
##markdown editor
![markdown editor](http://mint-ui.wemakers.net/static/doc/eb08196e6fac4b49acd586c9be4bdd01.png)
#site & doc & usage & live demo
[mint-ui](http://mint-ui.wemakers.net/)
#blog
[makerblog](http://www.wemakers.net/home/blog?cate=1002)
