/**
 *
 *
 */
(function($) {

  var namespace = 'liveclip';
  var relayEvents = 
    'click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,keypress,keyup'.split(',');

  /**
   * Adjust clipboard textarea size to cover parent clippable element.
   */
  function track() {
    var target = $(this);
    var clipboard = target.clipboard();
    var w = target.width(), h = target.height(), offset = target.offset();
    if (clipboard) clipboard.css({ width : w, height : h, top : offset.top, left : offset.left });
  }

  /**
   * Finding event target element, excluding clipboard element.
   * Pseudo event capturing, assuming no layered elements inside of element rectangle.
   */
  function capture(el, e) {
    var captured = _capture(el);
    var clipboard = captured.clipboard();
    captured = captured !== el && clipboard ? clipboard : captured;
    return captured;

    function _capture(el) {
      var target = el;
      el.children().each(function() {
        var child = $(this);
        var w = child.width(), h = child.innerHeight(), offset = child.offset();
        if (e.pageX > offset.left && e.pageX < offset.left + w &&
            e.pageY > offset.top  && e.pageY < offset.top  + h) {
          target = _capture(child);
        }
      })
      return target;
    }
  }

  /**
   * Context menu event handler 
   */
  function contextmenuHandler(e) {
    var clipboard = $(this);
    var target = clipboard.data(namespace + '-target');
    var options = target.data(namespace + '-clipboard-options');

    if (options.active && options.active.call(target) === false) {
      clipboard.attr('readonly', 'readonly');
      return;
    }

    if (options.paste || options.del) {
      clipboard.removeAttr('readonly');
    } else {
      clipboard.attr('readonly', 'readonly');
    }

    var val = options.copy ? options.copy.call(target) : '';
    clipboard.val(val);
    clipboard.get(0).select(); 
    if (options.paste || options.del) {
      val = clipboard.val();
      var watchPID = clipboard.data(namespace+'-watcher');
      if (watchPID) {
        clearInterval(watchPID);
        clipboard.removeData(namespace+'-watcher');
      }
      watchPID = setInterval(function() {
        var v = clipboard.val();
        if (v !== val) {
          try {
            if (v === '') {
              if (options.del) options.del.call(target)
            } else {
              if (options.paste) options.paste.call(target, v);
              clipboard.val('');
            }
          } catch(e) {}
          clearInterval(watchPID);
          clipboard.removeData(namespace+'-watcher');
        }
      }, 100);
      clipboard.data(namespace+'-watcher', watchPID);
    }

    //capture(target, e).trigger(e);

    /*
    e.stopPropagation();
    e.preventDefault();
    */
  }


  /**
   *
   */
  function keydownHandler(e) {
    var clipboard = $(this);
    var target = clipboard.data(namespace + '-target');
    var options = target.data(namespace + '-clipboard-options');

    if (e.metaKey) {
      switch (e.keyCode) {
        case 67 : // Ctrl + C
          var val = options.copy ? options.copy.call(target) : '';
          clipboard.val(val)
          clipboard.get(0).select(); 
          break;
        case 86 : // Ctrl + V
          if (options.paste) {
            clipboard.get(0).select(); 
            setTimeout(function() {
              options.paste.call(target, clipboard.val())
            }, 10);
          }
          break;
        case 88 : // Ctrl + X
          var val = options.copy ? options.copy.call(target) : '';
          clipboard.val(val)
          clipboard.get(0).select(); 
          if (options.del) {
            setTimeout(function() {
              options.del.call(target)
            }, 10);
          }
          break;
        default :
          break;
      }
    } else if (e.keyCode==46) { // delete
      if (options.del) options.del.call(target);
    }

    capture(target, e).trigger(e);

    e.stopPropagation();
    e.preventDefault();
  }



  $.fn.extend({
    /**
     *
     */
    clipboard : function(options) {
      var elements = this;

      if (options) { // setter

        $(elements).each(function() {
          var target = $(this);
          var clipboard = target.data(namespace + '-clipboard');
          if (!clipboard) { 
            clipboard = $('<textarea></textarea>')
              .addClass(namespace+'-clipboard')
              .css($.liveclip.clipboardCSS)
              .appendTo(document.body)
              .bind('contextmenu', contextmenuHandler)
              .bind('keydown', keydownHandler);
            $.each(relayEvents, function(i, eventName) {
              clipboard.bind(eventName+'.'+namespace, function(e) { 
                capture(target, e).trigger(e);
                e.stopPropagation();
              });
            });
            if ($.liveclip.autoTrack) { target.bind('mouseover.'+namespace, track) }
            target.data(namespace+'-clipboard', clipboard);
            clipboard.data(namespace+'-target', target);
          }
          target.data(namespace+'-clipboard-options', options);
          track.call(target);
        });
        return this;

      } else { // getter
        return $(this).data(namespace + '-clipboard');
      };

    }
    ,

    /**
     *
     */
    removeClipboard : function() {
      $(this).each(function() {
        $(this).clipboard().remove();
        $(this).unbind('mouseover.'+namespace, track)
               .removeData(namespace + '-clipboard')
               .removeData(namespace + '-clipboard-options');
      });
      return this;
    }

  });

  $.liveclip = {
    clipboardCSS : {
      position : 'absolute',
      opacity : .01
    },
    autoTrack : false
  }

  $.trackClipboards = function() {
    $('body > textarea.'+namespace+'-clipboard').each(function() {
      var clipboard = $(this);
      var target = clipboard.data(namespace + '-target');
      if (target && target.parent()) {
        track.call(target);
      } else {
        clipboard.remove();
      }
    });
  }

  $(function() {
    if ($.liveclip.autoTrack) {
      $(document).mousemove($.trackClipboards);
    }
  })

})(jQuery)
