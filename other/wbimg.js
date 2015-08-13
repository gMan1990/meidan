(function(w) {
	w.wbimg = {
		config : {// weibo config 以微博最新接口文档为准
			// pic_size: large mw1024 mw690 bmiddle mw240 cnw218[maby_no_watermark] thumbnail
			uri : '/statuses/user_timeline.json',// http://open.weibo.com/wiki/2/statuses/user_timeline
			page : 1, // int 返回结果的页码，默认为1。
			count : 200, // int 单页返回的记录条数，最大不超过100，超过100以100处理，默认为20。
			feature : 2, // int 过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。
			method : 'get'
		},
		alert : function(msg) {
			w.alert(msg);
		},
		getImgs : function(num, callback) {// TODO ENTER
			var cache = {};
			cache.num = num;
			cache.page = this.config.page;// start page
			cache.img_urls = [];// wbimg urls
			cache.statusess = [];// weibo statuses s
			this.asyncImgs(cache, callback);
		},
		asyncImgs : function(cache, callback) {
			var _t = this;
			w.WB2.anyWhere(function(W) {
				W.parseCMD(_t.config.uri, function(oResult, bStatus) {
					if (bStatus) {
						if (oResult.statuses.length) {
							_t.pushImgs(cache, callback, oResult.statuses,
									oResult.next_cursor);
						} else if (cache.page == _t.config.page) {
							// 第一页没有图片，config.page为第一页
							_t.alert('没有图片!!!');
						} else {// 当前页没有图片，config.page为第一页
							_t.fillImgs(cache, callback);
						}
					} else if (cache.page == _t.config.page) {
						// 第一次接口错误，config.page为第一页
						_t.alert('接口错误!!!');
					} else {// 当前次接口错误，config.page为第一页
						_t.fillImgs(cache, callback);
					}
				}, {// TODO args
					// API测试工具：http://open.weibo.com/tools/console
					// access_token : 'API测试工具中获取',
					page : cache.page,
					count : _t.config.count,
					feature : _t.config.feature
				}, {// opts
					method : _t.config.method
				});
			});
		},
		pushImgs : function(cache, callback, statuses, next_cursor) {
			for ( var i = 0, j = statuses.length; i < j; i++) {
				var _p = statuses[i].pic_urls.length ? statuses[i].pic_urls
						: statuses[i].retweeted_status.pic_urls;
				if (_p) {// 转发的微博可能被删
					for ( var m = 0, n = _p.length; m < n; m++) {
						cache.img_urls.push(_p[m].thumbnail_pic);
						if (cache.img_urls.length >= cache.num) {
							callback(cache.img_urls);
							return true;
						}
					}
				}
			}
			if (typeof next_cursor == 'number') {
				cache.statusess.push(statuses);
				if (next_cursor) {
					cache.page++;
					this.asyncImgs(cache, callback);
				} else {
					this.fillImgs(cache, callback);
				}
			}
			return false;
		},
		fillImgs : function(cache, callback) {
			for ( var i = 0, j = cache.statusess.length; i < j; i = i == j - 1 ? 0
					: i++) {
				if (this.pushImgs(cache, callback, cache.statusess[i])) {
					break;
				}
			}
		}
	};
})(window);
