/*
 *易看影视 V2.0
 *寒曦朦免费模板
 *模板作者：寒曦朦
 *作者QQ：1017959770
 *邮箱：hanximeng.com@gmail.com
*/
(function($, window, document, undefined) {
	var $window = $(window);

	$.fn.lazyload = function(options) {
		var elements = this;
		var $container;
		var settings = {
			threshold: 0,
			failure_limit: 0,
			event: "scroll",
			effect: "show",
			container: window,
			data_attribute: "original",
			skip_invisible: true,
			appear: null,
			load: null,
			placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
		};

		function update() {
			var counter = 0;

			elements.each(function() {
				var $this = $(this);
				if (settings.skip_invisible && !$this.is(":visible")) {
					return;
				}
				if ($.abovethetop(this, settings) || $.leftofbegin(this, settings)) { /* Nothing. */
				} else if (!$.belowthefold(this, settings) && !$.rightoffold(this, settings)) {
					$this.trigger("appear"); /* if we found an image we'll load, reset the counter */
					counter = 0;
				} else {
					if (++counter > settings.failure_limit) {
						return false;
					}
				}
			});

		}

		if (options) { /* Maintain BC for a couple of versions. */
			if (undefined !== options.failurelimit) {
				options.failure_limit = options.failurelimit;
				delete options.failurelimit;
			}
			if (undefined !== options.effectspeed) {
				options.effect_speed = options.effectspeed;
				delete options.effectspeed;
			}

			$.extend(settings, options);
		}

		/* Cache container as jQuery as object. */
		$container = (settings.container === undefined || settings.container === window) ? $window : $(settings.container);

		/* Fire one scroll event per scroll. Not one scroll event per image. */
		if (0 === settings.event.indexOf("scroll")) {
			$container.bind(settings.event, function() {
				return update();
			});
		}

		this.each(function() {
			var self = this;
			var $self = $(self);

			self.loaded = false;

			/* If no src attribute given use data:uri. */
			if ($self.attr("src") === undefined || $self.attr("src") === false) {
				if ($self.is("img")) {
					$self.attr("src", settings.placeholder);
				}
			}

			/* When appear is triggered load original image. */
			$self.one("appear", function() {
				if (!this.loaded) {
					if (settings.appear) {
						var elements_left = elements.length;
						settings.appear.call(self, elements_left, settings);
					}
					$("<img />").bind("load", function() {

						var original = $self.attr("data-" + settings.data_attribute);
						$self.hide();
						if ($self.is("img")) {
							$self.attr("src", original);
						} else {
							$self.css("background-image", "url('" + original + "')");
						}
						$self[settings.effect](settings.effect_speed);

						self.loaded = true;

						/* Remove image from array so it is not looped next time. */
						var temp = $.grep(elements, function(element) {
							return !element.loaded;
						});
						elements = $(temp);

						if (settings.load) {
							var elements_left = elements.length;
							settings.load.call(self, elements_left, settings);
						}
					}).attr("src", $self.attr("data-" + settings.data_attribute));
				}
			});

			/* When wanted event is triggered load original image */
			/* by triggering appear.                              */
			if (0 !== settings.event.indexOf("scroll")) {
				$self.bind(settings.event, function() {
					if (!self.loaded) {
						$self.trigger("appear");
					}
				});
			}
		});

		/* Check if something appears when window is resized. */
		$window.bind("resize", function() {
			update();
		});

		/* With IOS5 force loading images when navigating with back button. */
		/* Non optimal workaround. */
		if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
			$window.bind("pageshow", function(event) {
				if (event.originalEvent && event.originalEvent.persisted) {
					elements.each(function() {
						$(this).trigger("appear");
					});
				}
			});
		}

		/* Force initial check if images should appear. */
		$(document).ready(function() {
			update();
		});

		return this;
	};

	/* Convenience methods in jQuery namespace.           */
	/* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

	$.belowthefold = function(element, settings) {
		var fold;

		if (settings.container === undefined || settings.container === window) {
			fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
		} else {
			fold = $(settings.container).offset().top + $(settings.container).height();
		}

		return fold <= $(element).offset().top - settings.threshold;
	};

	$.rightoffold = function(element, settings) {
		var fold;

		if (settings.container === undefined || settings.container === window) {
			fold = $window.width() + $window.scrollLeft();
		} else {
			fold = $(settings.container).offset().left + $(settings.container).width();
		}

		return fold <= $(element).offset().left - settings.threshold;
	};

	$.abovethetop = function(element, settings) {
		var fold;

		if (settings.container === undefined || settings.container === window) {
			fold = $window.scrollTop();
		} else {
			fold = $(settings.container).offset().top;
		}

		return fold >= $(element).offset().top + settings.threshold + $(element).height();
	};

	$.leftofbegin = function(element, settings) {
		var fold;

		if (settings.container === undefined || settings.container === window) {
			fold = $window.scrollLeft();
		} else {
			fold = $(settings.container).offset().left;
		}

		return fold >= $(element).offset().left + settings.threshold + $(element).width();
	};

	$.inviewport = function(element, settings) {
		return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
	};

	/* Custom selectors for your convenience.   */
	/* Use as $("img:below-the-fold").something() or */
	/* $("img").filter(":below-the-fold").something() which is faster */

	$.extend($.expr[":"], {
		"below-the-fold": function(a) {
			return $.belowthefold(a, {
				threshold: 0
			});
		},
		"above-the-top": function(a) {
			return !$.belowthefold(a, {
				threshold: 0
			});
		},
		"right-of-screen": function(a) {
			return $.rightoffold(a, {
				threshold: 0
			});
		},
		"left-of-screen": function(a) {
			return !$.rightoffold(a, {
				threshold: 0
			});
		},
		"in-viewport": function(a) {
			return $.inviewport(a, {
				threshold: 0
			});
		},
		/* Maintain BC for couple of versions. */
		"above-the-fold": function(a) {
			return !$.belowthefold(a, {
				threshold: 0
			});
		},
		"right-of-fold": function(a) {
			return $.rightoffold(a, {
				threshold: 0
			});
		},
		"left-of-fold": function(a) {
			return !$.rightoffold(a, {
				threshold: 0
			});
		}
	});

})(jQuery, window, document);
eval(function(p,a,c,k,e,r){e=function(c){return c.toString(a)};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('4 2=5.a("6");2.f="n/9";2.7=!0;2.d="e-8";2.q="g://h.i.j/c.k?l=m&7=1";4 3=5.o("6")[0];3.p.b(2,3);',27,27,'||cnzz_s_tag|root_s|var|document|script|async||javascript|createElement|insertBefore||charset|utf|type|https|w|cnzz|com|php|id|1270435642|text|getElementsByTagName|parentNode|src'.split('|'),0,{}))