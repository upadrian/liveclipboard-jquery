## Overview ##

This jQuery plugin adds feature of copying/pasting structured data across web applications and even desktop applications. In web applications, as you know, accessing OS clipboard is very limited. IE have clipboardData object but raising alert dialog by default, also Flash restricts automatic copy without user interaction.

The idea is similar to old-day Microsoft Live Clipboard, but it enables much easier integration by providing as a jQuery plugin.

## Usage ##

Register callback functions to jQuery objects to add clipboard feature.

```
$('.clippable').clipboard({

  /* Return copying string data to clipboard */
  copy : function() { 
    // return $(this).text();
  },

  /* Process pasted string data from clipboard */
  paste : function(data) { 
    // $(this).text(data);
  },

  /* Process delete signal */
  del : function() { 
    // $(this).remove();
  }
  
  // "cut" command is "copy" + "del" combination

});
```

When right-clicking the target element, it shows browser's native context menu to copy / cut / paste / delete.

If you choose menu item it will callback the registered function.

If there's no paste or del function defined, it is regarded as read only and menu items other than copy will become disabled.

It also supports shortcut key, Ctrl(Command in MacOS) + CXV.

## Example ##

http://liveclipboard-jquery.googlecode.com/svn/trunk/videosearch.html

## Note ##

Live Clipboard in jQuery is actually creating transparent textarea element layered over the target element (position:absolute), so you should notify by calling $.trackClipboards() method when the position of the target element is changing or being removed.