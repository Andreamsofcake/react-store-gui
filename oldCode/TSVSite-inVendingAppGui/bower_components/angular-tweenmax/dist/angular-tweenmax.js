var tweenmaxApp = angular.module('tweenmaxApp', []);
tweenmaxApp.service('Scroller', function(TweenMax) {

  this.to = function(duration, options) {
    if (navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)) {
      window.scrollTo(options.x, options.scrollTop);
    } else if (navigator.userAgent.match(/Firefox/i) || navigator.userAgent.match(/MSIE/i)) {
      TweenMax.to(document.documentElement, duration, options);
    } else {
      TweenMax.to(document.body, duration, options);
    }
  };

});
(function(TweenMax) {
  tweenmaxApp.factory('TweenMax', function($window) {
    return TweenMax;
  });
})(TweenMax);