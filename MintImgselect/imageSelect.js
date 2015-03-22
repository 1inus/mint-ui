/*自动加载css*/
(function(){
	var path = $("script").last().attr("src");
	//样式统一放在css下，统一命名为style.css
	$("head:first").append(
		$('<link rel="stylesheet"/>')
			.attr("href", path.replace(path.substring(path.lastIndexOf("/")+1), "css/style.css"))
	);
})();

(function(){
	$.fn.MintImgSelect = function(setting){
		setting = $.extend({
				onSelect : $.noop,
				onEnd : $.noop
			}, setting);
			
		/*以下是为了提高效率的缓存变量*/
		var M = Math,
			abs = M.abs,
			ceil = M.ceil,
			max = M.max,
			min = M.min,
			round = M.round,
			
			/*
			 * 奇葩的字符串替换，为节省每一b的流量而努力，哈哈
			 * <i class=" 		-> A
			 * border border 	-> B
			 * resize resize 	-> C
			 * "></i> 			-> D
			 */
			tool = $(('<div class="select_tool" onselectstart="return false">'+
						'AcoverD'+
						'AmaskD'+//为了防止ie下没有背景的元素无法被点击的问题
						'Apane">'+
							'AB0D'+
							'AB1D'+
							'AB2D'+
							'AB3D'+
							'AC0D'+
							'AC1D'+
							'AC2D'+
							'AC3D'+
							'AC4D'+
							'AC5D'+
							'AC6D'+
							'AC7D'+
						'</i>'+
					'</div>').replace(/A/g, '<i class="').
							replace(/B/g,'border border').
							replace(/C/g, 'resize resize').
							replace(/D/g, '"></i>')),
			
			img 		= $(this),
			cover 		= tool.find(".cover"),		//图片覆盖层
			pane 		= tool.find(".pane"),		//透视窗格
			doc 		= $(document),
			ratio 		= setting.ratio,
			
			/*鼠标在cover上点击时的相对位置(offset):e.clientY & e.clientX*/
			clickOY, clickOX,
			
			/*图片的渲染高度和宽度*/
			imgH, imgW,
			
			/*原始图片的高度和宽度*/
			realH, realW,
			
			/*高宽的缩放率*/
			zoomH, zoomW,
			
			isSelect,
			
			/*增量*/
			dx, dy,
		
			p1,p2,
			
			/*pane position (变动前)*/
			paneTop, paneRight, paneBottom, paneLeft,
			
			/*pane position (变动中)*/
			paneT, paneL, paneR, paneB,
			
			resizeType,
			
			/*在约束比例缩放时，标志是否单边被拖动*/
			singleResize,
			
			previewPanes = $(setting.preview),
			isPreview = false,
			previewScope = [];
		
		
		previewPanes.each(function(i, t){
			t = $(t);
			previewScope.push({
				h : t.height(),
				w : t.width()
			});
			
			isPreview = true;
		}).addClass("mint_imgselect_preview");
		
		function init(){
			var o = img.position();
			
			paneT = o.top+parseInt(img.css("padding-top"))+parseInt(img.css("margin-top"));
			paneL = o.left+parseInt(img.css("padding-left"))+parseInt(img.css("margin-left"));
			imgW = img.width();
			imgH = img.height();
			
			tool.css({
				"top"	: paneT,
				"left"	: paneL,
				"width"	: imgW,
				"height": imgH
			});
			
			var realImg = new Image(),
				src = img.attr("src"); 
			realImg.src = src; 
		    
			realH = realImg.height;
			realW = realImg.width;
			
			/*图片缩放的比例*/
			zoomH = imgH/realH;
			zoomW = imgW/realW;
			
			if(previewPanes.length > 0){
				previewPanes.html($("<img/>").attr("src", src)).each(function(i, t){
					previewScope[i].img = $(t).find("img");
				});
			}
			
			var scope = setting.scope;
			if(scope && (scope.left + scope.width) <= imgW && (scope.top + scope.height <= imgH) && (!setting.ratio || (scope.width/scope.height)==setting.ratio)){
				paneT = scope.top;
				paneL = scope.left;
				paneB = imgH - scope.height;
				paneR = imgW - scope.width;
				cover.css("opacity",".5");
				pane.css("display", "block");
				refresh();
			}
		}
		
		function refresh(){
			pane.css({
				"top":paneT,
				"right":paneR,
				"bottom":paneB,
				"left":paneL
			});
			
			cover.css("border-width", paneT+"px " + paneR + "px " + paneB + "px " + paneL + "px");
			
			var realScope =  { //选区的真实参数（图片被缩放前）
					"top" : round(paneT/zoomH),
					"left" : round(paneL/zoomW),
					"width" : round((imgW-paneL-paneR)/zoomW),
					"height" : round((imgH-paneT-paneB)/zoomH)
				};
			
			setting.onSelect({//选区的视觉参数
				"top" : paneT,
				"left" : paneL,
				"width" : imgW-paneL-paneR,
				"height" : imgH-paneT-paneB
			} , realScope);
			
			preview(realScope);
		}
		
		/*预览*/
		function preview(rs){
			if(rs.height == 0 || rs.width == 0) return;
			
			$.each(previewScope, function(i, img){
				var y = img.h/rs.height,
					x = img.w/rs.width,
					t = round(rs.top*y),
					l = round(rs.left*x),
					h = round(realH*y),
					w = round(realW*x);
				
				img.img.css({
					"width" : w,
					"height": h,
					"margin-top" : -t,
					"margin-left": -l
				});
			});
		}
		
		if(img.attr("src")) init();
		img.after(tool).on("load", function(e){
			init();
		});
		
		tool.find(".mask").mousedown(function(e){
			var cof = cover.css("opacity",".5").offset();
			
			paneT = paneTop = (e.offsetY ? e.offsetY : e.clientY - cof.top);
			paneL = paneLeft = (e.offsetX ? e.offsetX : e.clientX - cof.left);
			paneR = paneRight = imgW - paneLeft;
			paneB = paneBottom = imgH - paneTop;
			
			refresh();
			pane.css("display", "block").addClass("no_resize");
			
			/*默认向右下拖*/
			newType = resizeType = 0 | 2 | 4;
			doc.bind("mousemove", resize);
		});
		
		tool.mousedown(function(e){
			isSelect = true;
			/*点击时的鼠标位置*/
			clickOY = e.clientY;
			clickOX = e.clientX;
			
			return false;
		}).on("dragstart", function(){ //防止ie拖动图片
			return false;
		});
		
		/*可能是拖动选区，也可能是调整选区大小*/
		pane.mousedown(function(e){
			var t = $(e.target),
				p = pane.position();
			
			paneT = paneTop = p.top;
			paneL = paneLeft = p.left;
			paneR = paneRight = imgW - paneLeft - pane.width();
			paneB = paneBottom = imgH - paneTop - pane.height();
			
			if(t.is(".pane")){
				tool.bind("mousemove", movePane);
			} else {
				if(t.is(".resize0,.border0")){
					resizeType = 0 | 1;
					singleResize = 1;
				} else if(t.is(".resize1")){
					resizeType = 0 | 1 | 2;
				} else if(t.is(".resize2,.border1")){
					resizeType = 0 | 2;
					singleResize = 1;
				} else if(t.is(".resize3")){
					resizeType = 0 | 2 | 4;
				} else if(t.is(".resize4,.border2")){
					resizeType = 0 | 4;
					singleResize = 1;
				} else if(t.is(".resize5")){
					resizeType = 0 | 4 | 8;
				} else if(t.is(".resize6,.border3")){
					resizeType = 0 | 8;
					singleResize = 1;
				} else if(t.is(".resize7")){
					resizeType = 0 | 8 | 1;
				}
				newType = resizeType
				doc.bind("mousemove", resize);
			}
		});
		
		/*取消动态绑定的事件*/
		doc.mouseup(function(e){
			if(isSelect){
				isSelect = false;
				singleResize = 0;
				
				tool.unbind("mousemove", movePane);
				doc.unbind("mousemove", resize);
				
				pane.removeClass("no_resize");
				
				/*没有面积的选区被认为是无应用意义的*/
				if(pane.height()*pane.width() == 0){
					cover.css({"opacity":"0","filter":"alpha(opacity=0)"});
					pane.css("display","none");
				}
				
				setting.onEnd({//选区的视觉参数
					"top" : paneT,
					"left" : paneL,
					"width" : imgW-paneL-paneR,
					"height" : imgH-paneT-paneB,
					"imgHeight":imgH,
					"imgWidth" : imgW
				} , { //选区的真实参数（图片被缩放前）
					"top" : round(paneT/zoomH),
					"left" : round(paneL/zoomW),
					"width" : round((imgW-paneL-paneR)/zoomW),
					"height" : round((imgH-paneT-paneB)/zoomH),
					"imgHeight" : realH,
					"imgWidth" : realW
				});
			}
		});
		
		/*移动选取效果*/
		var paneT, paneL, paneR, paneB;
		function movePane(e){
			dy = e.clientY-clickOY;
			dx = e.clientX-clickOX;
			paneT = paneTop + dy;
			paneL = paneLeft + dx;
			paneR = paneRight - dx;
			paneB = paneBottom - dy;

			/*上下移动*/
			if(paneT < 0){
				paneT = 0;
				paneB = paneBottom + paneTop;
			} else if(paneB < 0){
				paneT = paneTop + paneBottom;
				paneB = 0;
			}
			
			/*左右移动*/
			if(paneL < 0){
				paneL = 0;
				paneR = paneRight + paneLeft;
			} else if(paneR < 0){
				paneL = paneLeft + paneRight;
				paneR = 0;
			}
			refresh();
		};
		

		/*
		 * 采用补码的形式标志resizeType
		 * 当拖动超过边界时需要转变状态：
		 * 左 <-> 右
		 * 上 <-> 下
		 * 
		 * 对应的就是和具体的 数字做 "&" 运算
		 * 
		 * 
		 * 以下是状态代码（顺时针）
		 * 
		 * 操作码	值	|	<-动作->		|	反码		值
		 * 0001 	1	|	<-拖上边->	|	1110	14(15-1)
		 * 0010		2	|	<-拖右边->	|	1101	13(15-2)
		 * 0100		4	|	<-拖下边->	|	1011	11(15-4)
		 * 1000		8	|	<-拖左边->	|	0111	7(15-8)
		 */
		var paneScale = {},
			/*宽度和高度的增量*/
			dW, dH, 
			newType;
		
		function resize(e){
			dy = e.clientY-clickOY;
			dx = e.clientX-clickOX;
			
			/*
			 * 无论是自由缩放还是固定比例缩放，
			 * 上边和下边 不会同时拖动
			 * 左边和右边 不会同时拖动
			 */
			/*
			 * 自由拖动
			 */
			
			/*拖动上边*/
			if(1 & resizeType){
				dH = -dy;
				paneT = paneTop + dy;
				
				if(paneT < 0){
					//裁剪上边缘
					paneT = 0;
					dH = paneTop;
				} else if(paneT + paneB > imgH){
					clickOY += imgH - paneBottom - paneTop;
					
					/*
					 * 相当于重新点击了一次调整把手
					 * 这里是计算模拟把手重新点击的环境
					 */
					if(!ratio){
						paneT = imgH - paneB;
					} else {
						paneT = paneTop = imgH - paneBottom;
						
						var paneW = imgW - paneL - paneR,
							paneWidth = imgW - paneLeft - paneRight;
						
						if(2 & resizeType || singleResize){	//当前同时拖动上边和右边
							paneR = paneRight = imgW - paneLeft;
							clickOX -= paneWidth;
						} else { //当前同时拖动上边和左边
							paneL = paneLeft = imgW - paneRight;
							clickOX += paneWidth;
						}
						
						dx = e.clientX-clickOX;
					}

					//切换到拖动下边
					newType = resizeType & 14 | 4;
				}
			} else if(4 & resizeType){		/*拖动下边*/
				dH = dy;
				paneB = paneBottom - dy;
				
				if(paneB < 0){
					//裁剪下边缘
					paneB = 0;
					dH = paneBottom;
				} else if(paneB + paneT > imgH){
					clickOY -= imgH - paneBottom - paneTop;

					if(!ratio){
						paneB = imgH - paneT;
					} else {
						paneB = paneBottom = imgH - paneTop;
						
						var paneW = imgW - paneL - paneR,
							paneWidth = imgW - paneLeft - paneRight;
						
						if(2 & resizeType || singleResize){ //当前同时拖动下边和右边
							paneR = paneRight = imgW - paneLeft;
							clickOX -= paneWidth;
						} else {	//当前同时拖动下边和左边
							paneL = paneLeft = imgW - paneRight;
							clickOX -= paneWidth;
						}
						
						dx = e.clientX-clickOX;
					}
					
					
					//切换到拖动上边
					newType = resizeType & 11 | 1;
				}
			}
			
			/*拖动右边*/
			if(2 & resizeType){
				dW = dx;
				paneR = paneRight - dx;

				if(paneR < 0){
					//裁剪右边缘
					paneR = 0;
					dW = paneRight;
				} else if(paneR + paneL > imgW){ //右边切到左边
					clickOX -= imgW - paneLeft - paneRight;
					
					if(!ratio){
						paneR = imgW - paneL;
					} else {
						paneR = paneRight = imgW - paneLeft;
						
						var paneH = imgH - paneT - paneB,
							paneHeight = imgH - paneTop - paneBottom;
						
						if(4 & resizeType || singleResize){ //当前同时拖动右边和下边
							paneB = paneBottom = imgH - paneTop;
							clickOY -= paneHeight;
							
							dH = e.clientY - clickOY;
							dW = e.clientX - clickOX;
							
							paneB = paneBottom - dH;
						} else {//当前同时拖动右边和上边
							paneT = paneTop = imgH - paneBottom;
							clickOY += paneHeight;
							
							dH = clickOY - e.clientY;
							dW = clickOX - e.clientX;
							
							paneT = paneTop - dH;
						}
					}
					
					//切换到拖动左边
					newType = resizeType & 13 | 8;
				}
			} else if(8 & resizeType){ /*拖动左边*/
				dW = -dx;
				paneL = paneLeft + dx;
				if(paneL < 0){
					//裁剪左边缘
					paneL = 0;
					dW = paneLeft;
				} else if(paneL + paneR > imgW){ //左边切到右边
					clickOX += imgW - paneRight - paneLeft;
					
					if(!ratio){
						paneL = imgW - paneR;
					} else {
						paneL = paneLeft = imgW - paneRight;
						
						var paneH = imgH - paneT - paneB,
							paneHeight = imgH - paneTop - paneBottom;
						
						if(4 & resizeType || singleResize){ //当前同时拖动左边和下边
							paneB = paneBottom = imgH - paneTop;
							clickOY -= paneHeight;
							
							dH = e.clientY - clickOY;
							paneB = paneBottom - dH;
						} else {//当前同时拖动左边和上边
							paneT = paneTop = imgH - paneBottom;
							clickOY += paneHeight;
							
							dH = clickOY - e.clientY;
							
							paneT = paneTop - dH;
						}
					}
					
					//切换到拖动右边
					newType = resizeType & 7 | 2;
				}
			}
			
			resizeType = newType;
			/*
			 * 固定比例拖动
			 * 各边要相互约束
			 * 对paneT, paneR, paneB, paneL 重新进行计算
			 */
			if(ratio){
				/*选择哪个偏移量作为调整大小的基准*/

				/*拖动上边*/
				if(1 & resizeType){
					//单边拖动时做了一些不对称的处理，主要是为了兼顾人的使用习惯
					if(dW <= dH*ratio || singleResize){
						if(2 & resizeType  || singleResize){ //上边和右边同时拖动
							paneR = paneRight - round(dH*ratio);
							if(paneR < 0){
								paneT = paneTop - round(paneRight/ratio);
								paneR = 0;
							}
						} else { //上边和左边同时拖动
							paneL = paneLeft - round(dH*ratio);
							if(paneL < 0){
								paneT = paneTop - round(paneLeft/ratio);
								paneL = 0;
							}
						}
					}
				} else if(4 & resizeType){		/*拖动下边*/
					if(dW <= dH*ratio || singleResize){
						if(2 & resizeType || singleResize){ //下边和右边同时拖动
							paneR = paneRight - round(dH*ratio);
							if(paneR < 0){
								paneB = paneBottom - round(paneRight/ratio);
								paneR = 0;
							}
						} else { //下边和左边同时拖动
							paneL = paneLeft - round(dH*ratio);
							if(paneL < 0){
								paneB = paneBottom - round(paneLeft/ratio);
								paneL = 0;
							}
						}
					}
				}
				
				/*拖动右边*/
				if(2 & resizeType){
					if(dW > dH*ratio || singleResize){
						if(4 & resizeType || singleResize){ //右边和下边同时拖动
							paneB = paneBottom - round(dW/ratio);
							
							if(paneB < 0){
								paneR = paneRight - round(paneBottom*ratio);
								paneB = 0;
							}
						} else { //右边和上边同时拖动
							paneT = paneTop - round(dW/ratio);
							if(paneT < 0){
								paneR = paneRight - round(paneTop*ratio);
								paneT = 0;
							}
						} 
					}
					
					
				} else if(8 & resizeType){		/*拖动左边*/
					if(dW > dH*ratio || singleResize){
						if(4 & resizeType || singleResize){ //左边和下边同时拖动
							paneB = paneBottom - round(dW/ratio);
							if(paneB < 0){
								paneL = paneLeft - round(paneBottom*ratio);
								paneB = 0;
							}
						} else { //左边和上边同时拖动
							paneT = paneTop - round(dW/ratio);
							if(paneT < 0){
								paneL = paneLeft - round(paneTop*ratio);
								paneT = 0;
							}
						}
					}
				}
			}
			
			refresh();
		}
	}
})($);