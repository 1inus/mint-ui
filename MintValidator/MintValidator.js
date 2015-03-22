/*自动加载css*/
(function(){
	var path = $("script").last().attr("src");
	//样式统一放在css下，统一命名为style.css
	$("head:first").append(
		$('<link rel="stylesheet"/>').
		attr("href", path.replace(path.substring(path.lastIndexOf("/")+1), "css/style.css"))
	);
})();

var MintValidator = function(form, settings){
	var thiz 		= this;
	thiz.ajax 		= 0;
	thiz.settings	= $.extend(true, {
	        inputs:[],
	        submitButton:"",
	        rules : thiz.rules,
	        onSubmit:$.noop,
	        showTipsAfterInit : false
	    }, settings);
	
	/*合并新的规则*/
	$.extend(thiz.rules, settings.rules);
	
	thiz.form 		= form;
	 /*将设置信息分离出来，方便以后遍历*/
	thiz.initContext();
	
	/*整个表单的验证结果*/
	thiz.result		= false;
	
	/*以下两个变量是为模拟同步而设置，在ajax验证时使用，因为js无法多线程*/
	thiz.isBlocked	= false; //表单提交是否被暂时阻塞。在ajax请求前会设置成true，待所有ajax校验返回时才设置为true
	thiz.isSubmit 	= false; //表单是否要提交。在ajax校验返回时使用
	
   /*失焦提示*/
    form.delegate("input,textarea","blur",function(){
        thiz.doValidate($(this));
    }).delegate("input,textarea","focus",function(){ /*聚焦提示*/
    	var input = $(this),
    		setting = input.data("setting");
    	
    	if(setting){
    		thiz.tipStatu("focus",input, setting.focusMsg);
    	}
    });
    
    /*提交表单*/
    form.submit(function(e){
    	thiz.isSubmit = thiz.result = true;
    	
    	$.each(form.find("input,textarea"),function(i,n){
    		thiz.result = (thiz.doValidate($(n)) && thiz.result);
    	});
    	return thiz.submit();
    });
    
    /*如果指定了一个响应事件的元素，则在该元素被点击时执行此方法*/
    if(thiz.settings.submitButton){
    	$(thiz.settings.submitButton).click(function(e){
    		thiz.isSubmit = thiz.result = true;
        	$.each(form.find("input,textarea"),function(i,n){
        		thiz.result = (thiz.doValidate($(n)) && thiz.result);
        	});
        	
    		thiz.submit();
    	});
    }
};

MintValidator.prototype = {
	rules : {},
		
	tipStatu : function(type, input, msg){
		input
			.removeClass("status_focus status_right status_error")
			.addClass("status_"+type);
		
		if(msg==undefined){
			input.data("tip").hide();
			return;
		}
		
		var position = input.position();
		position.top = position.top+parseInt(input.css("margin-top"));
    	
		input.data("tip")
    		.removeClass("focus_tip right_tip error_tip ajax_check_tip")
    		.addClass(type+"_tip")
    		.html(msg?msg:"")
    		.css({
    			"display"	: "block",
        		"position" 	: "absolute",
        		"top"		: position.top+Math.ceil((input.outerHeight()-32)/2),
        		"left"		: position.left + input.innerWidth() + 12
        	});
    },
    
	/*正则匹配*/
	checkReg : function(rule, input){
		var setting = input.data("setting");
		if(rule.rule.test(input.val())){
			this.tipStatu("right", input, setting.rightMsg);
			return true;
		}else{
			this.tipStatu("error", input, rule.tip);
			return false;
		}
	},
	
	/*ajax checking*/
	ajaxCheck : function(setting, input){
		var thiz = this, ajax = setting.ajax;
		
		/*异步验证时，标志是否所有的ajax验证已经返回*/
		thiz.isBlocked = true;
		thiz.ajax += 1;
		
		function ajaxCallBack(data){
			thiz.ajax -= 1;
			
			/*ajax全部校验完毕*/
			if(thiz.ajax == 0){
				thiz.isBlocked = false;
				
				if(thiz.isSubmit){
					thiz.submit();
				}
			}
		}
		
		$.ajax({
			url:ajax.url,
			data : input.attr("name")+"="+input.val(),
			dataType : ajax.dataType ? ajax.dataType : null,
			type : ajax.type ? ajax.type : "get",
			beforeSend:function(){
				thiz.tipStatu("ajax_check", input, "验证中...");
			},
			success:function(d){
				var d = ajax.filter(d);
				
				if(d.result){
					thiz.tipStatu("right", input, d.msg);
					thiz.result = thiz.result && true;
				} else {
					thiz.tipStatu("error", input, d.msg);
					thiz.result = thiz.result && false;
				}
				thiz.result = thiz.result && d.result;
				ajaxCallBack();
			},
			
			error:function(){
				thiz.tipStatu("error",input,"网络出错");
				thiz.result = thiz.result && false;
				ajaxCallBack();
			}
		});
	},
	
	/*初始化（每个input的）验证环境*/
	initContext : function(){
		var thiz 	= this, 
			form 	= thiz.form, 
			settings = thiz.settings,
			tip, input;
			
		$.each(settings.inputs, function(i, inputSetting){
			input = form.find('[name="'+ inputSetting.name +'"]');
			
			if(input.length != 0){
				tip = $("<span class='mint_validator input_tip'></span>");
				input.
					data("tip", tip).
					data("setting", inputSetting).
					after(tip);

				if(settings.showTipsAfterInit && inputSetting.focusMsg){
	    			thiz.tipStatu("focus", input, inputSetting.focusMsg);
	    		}
			}
    	});
	},
	
	/*检查单个表单域输入*/
	doValidate : function(input){
		var thiz 	= this,
			form 	= thiz.form,
			inputSetting = input.data("setting"),
			result 	= true,
			rules 	= thiz.settings.rules;
		
		if(inputSetting && inputSetting.rules){
			$.each(inputSetting.rules, function(i, ruleName){
				if(rules[ruleName] && result){
					var rule = rules[ruleName];
					if($.type(rule.rule) == "regexp"){
						result = thiz.checkReg(rule, input) && result;
						
					} else if($.type(rule.rule) == "function"){
						var formData = {};
						
						$.each(form.serializeArray(),function(i, item){
							formData[item.name] = item.value;
						});
						
						/*调用用户定义的回调函数验证字段*/
						result = rule.rule(input.val(), formData) && result;
						result ? thiz.tipStatu("right", input, inputSetting.rightMsg) : thiz.tipStatu("error", input, rule.tip);
					}
				} else {
					return false;
				}
			});
			
			/*所有的客户端验证通过之后，再进行ajax验证*/
			if(result && inputSetting.ajax){
				thiz.ajaxCheck(inputSetting, input);
			}
		}
		
		return result;
	},
	
	submit : function(){
		var thiz = this;
		
		if(!thiz.isBlocked){
			thiz.isSubmit = false;
			/*第一个参数指按钮,第二个参数指表单,第三个参数指表单的验证结果：通过与否*/
			
			return thiz.settings.onSubmit(thiz.result, thiz.form);
		}
	}
};

$.fn.validateForm = function(settings){
	new MintValidator(this, settings);
    return this;
};