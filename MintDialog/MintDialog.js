/*自动加载css*/
(function(){
	var path = $("script").last().attr("src");
	//样式统一放在css下，统一命名为style.css
	$("head:first").append(
		$('<link rel="stylesheet"/>').
		attr("href", path.replace(path.substring(path.lastIndexOf("/")+1), "css/style.css"))
	);
})();

function MintDialog(setting){
	var defaultSetting = {
		title:"",
		body:"",
		modal : true,
		moveable:false,
		closeOnMaskClick:true,
		beforeClose : function(){return true;},
		onShow : $.noop
	};
	setting =  $.extend(defaultSetting, setting);
	var mask = $(
			'<div class="dialog_mask close">'+
				'<div class="dialog">'+
					'<div class="head">'+
						'<div class="title"></div>'+
						'<span class="close_btn" title="关闭"></span>'+
					'</div>'+
					'<div class="body"></div>'+
				'</div>'+
			'</div>');
				
	var dialog = mask.children(":first"),
		title = dialog.find(".head .title"),
		body = dialog.children(".body");
		
	if(setting.title){title.html(setting.title);}
	if(setting.body){body.html(setting.body);}
	if(setting.modal){
		mask.addClass("modal");
	} else {
		if(setting.moveable) {
			dialog.addClass("moveable");
			
			(function(){
				var isD = false,
					doc = $(document),
					position,
					click;
				
				function move(e){
					if(Math.abs(e.clientX-click.l) > 5 || Math.abs(e.clientY-click.t) > 5){
						doc.unbind("mousemove", move);
						dialog.css({
							"position" : "absolute",
							"top":position.top,
							"left":position.left
						});
						
						if(!dialog.is(".hasmoved")){
							dialog.addClass("hasmoved");
						}
						
						doc.bind("mousemove", moving);
					}
				}
				
				function moving(e){
					dialog.css({
						"top":position.top  	+ e.clientY - click.t,
						"left":position.left 	+ e.clientX - click.l
					});
				}
				
				/*绑定移动*/
				title.mousedown(function(e){
					e.preventDefault();
					isD = true;
					position = dialog.position();
					
					click={
						l : e.clientX,
						t : e.clientY
					}
					
					doc.bind("mousemove", move);
				});
				
				$(document).mouseup(function(){
					doc.unbind("mousemove", moving);
					doc.unbind("mousemove", move);
					isD = false;
				});
			})();
		}
	}
	
	mask.appendTo("body");
	
	var out = {
		/*设置窗口标题*/
		setTitle : function(t){
			title.html(t);
			return this;
		},
		
		/*设置窗口内容*/
		setBody : function(b){
			body.empty().append(b);
			if(!setting.modal && !dialog.is('.hasmoved')){
				mask.css("margin-top",-dialog.height()/2);
			}
			return this;
		},
		
		getTitle : function(){
			return title;
		},
		
		getBody : function(){
			return body;
		},
		
		/*显示窗口*/
		show : function(){
			mask.fadeIn(100, setting.onShow());
			if(!setting.modal && !dialog.is('.hasmoved')){
				mask.css("margin-top",-(dialog.height()/2));
			}
			return this;
		},
		
		/*隐藏窗口*/
		close : function(){
			if(setting.beforeClose()){
				mask.fadeOut(100);
			}
			return this;
		}
	}
	
	dialog.find(".close_btn").click(function(){
		out.close();
	});
	
	if(setting.closeOnMaskClick){
		mask.mousedown(function(e){
			if(e.target == this){
				out.close();
			}
		});
	}
	
	return out;
}