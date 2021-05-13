const MD = {};

MD.Editor = function(){
  
  const serializer = new XMLSerializer();
  const _self = this;
  const workarea = document.getElementById("workarea");
  _self.selected = [];

  function clear(){
    var dims = state.get("canvasSize");
    $.confirm("<strong>Do you want to clear the drawing?</strong>\nThis will also erase your undo history", function(ok) {
      if(!ok) return;
      state.set("canvasMode", "select")
      svgCanvas.clear();
      svgCanvas.setResolution(dims[0], dims[1]);
      editor.canvas.update();
      editor.zoom.reset();
      editor.panel.updateContextPanel();
      editor.paintBox.fill.prep();
      editor.paintBox.stroke.prep();
      svgCanvas.runExtensions('onNewDocument');
    });
  }

  function save(){
    _self.menu.flash($('#file_menu'));
    svgCanvas.save();
  }

  function undo(){
    if (!svgCanvas.undoMgr.getUndoStackSize()) return false;
    _self.menu.flash($('#edit_menu'));
    svgCanvas.undoMgr.undo();
  }

  function redo(){
    if (svgCanvas.undoMgr.getRedoStackSize() > 0) {
      _self.menu.flash($('#edit_menu'));
      svgCanvas.undoMgr.redo();
    }
  }

  function duplicateSelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#edit_menu'));
    svgCanvas.cloneSelectedElements(20,20);
  };

  function deleteSelected(){
    if (svgCanvas.pathActions.getNodePoint()) svgCanvas.pathActions.deletePathNode();
    else svgCanvas.deleteSelectedElements();
  }

  function cutSelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#edit_menu'));
    svgCanvas.cutSelectedElements(); 
  }

  function copySelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#edit_menu'));
    svgCanvas.copySelectedElements();
  }
  
  function pasteSelected(){
    _self.menu.flash($('#edit_menu'));
    var zoom = svgCanvas.getZoom();       
    var x = (workarea.scrollLeft + workarea.offsetWidth/2)/zoom  - svgCanvas.contentW; 
    var y = (workarea.scrollTop + workarea.offsetHeight/2)/zoom  - svgCanvas.contentH;
    svgCanvas.pasteElements('point', x, y); 
  }

  function moveToTopSelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#object_menu'));
    svgCanvas.moveToTopSelectedElement();
  }

  function moveToBottomSelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#object_menu'));
    svgCanvas.moveToBottomSelectedElement();
  }
    
  function moveUpSelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#object_menu'));
    svgCanvas.moveUpDownSelected("Up");
  }

  function moveDownSelected(){
    if (!_self.selected.length) return false;
    _self.menu.flash($('#object_menu'));
    svgCanvas.moveUpDownSelected("Down");
  }
 
  function convertToPath(){
    if (!_self.selected.length) return false;
    svgCanvas.convertToPath();
    var elems = svgCanvas.getSelectedElems()
    svgCanvas.selectorManager.requestSelector(elems[0]).reset(elems[0])
    svgCanvas.selectorManager.requestSelector(elems[0]).selectorRect.setAttribute("display", "none");
    svgCanvas.setMode("pathedit")
    path.toEditMode(elems[0]);
    svgCanvas.clearSelection();
    editor.panel.updateContextPanel();
  }

  function reorientPath(){
    if (!_self.selected.length) return false;
    path.reorient();
  }

  function switchPaint(strokeOrFill) {
    var stroke_rect = document.querySelector('#tool_stroke rect');
    $("#tool_stroke").toggleClass('active')
    $("#tool_fill").toggleClass('active')
    var fill_rect = document.querySelector('#tool_fill rect');
    var fill_color = fill_rect.getAttribute("fill");
    var stroke_color = stroke_rect.getAttribute("fill");
    var stroke_opacity = parseFloat(stroke_rect.getAttribute("stroke-opacity"));
    if (isNaN(stroke_opacity)) {stroke_opacity = 100;}
    var fill_opacity = parseFloat(fill_rect.getAttribute("fill-opacity"));
    if (isNaN(fill_opacity)) {fill_opacity = 100;}
    var stroke = editor.paintBox.stroke.getPaint(stroke_color, stroke_opacity, "stroke");
    var fill = editor.paintBox.fill.getPaint(fill_color, fill_opacity, "fill");
    editor.paintBox.fill.setPaint(stroke, true);
    editor.paintBox.stroke.setPaint(fill, true);
  };

  function escapeMode(){
    state.set("canvasMode", "select");
    state.set("canvasContent", svgCanvas.getSvgString())
  }

  // called when we've selected a different element
  function selectedChanged(window,elems) {
    const mode = svgCanvas.getMode();
    _self.selected = elems.filter(Boolean);
    editor.paintBox.fill.update();
    editor.paintBox.stroke.update();
    editor.panel.updateContextPanel(_self.selected);
  };

  function contextChanged(win, context) {
  
    var link_str = '';
    if(context) {
      var str = '';
      link_str = '<a href="#" data-root="y">' + svgCanvas.getCurrentDrawing().getCurrentLayerName() + '</a>';
      
      $(context).parentsUntil('#svgcontent > g').addBack().each(function() {
        if(this.id) {
          str += ' > ' + this.id;
          if(this !== context) {
            link_str += ' > <a href="#">' + this.id + '</a>';
          } else {
            link_str += ' > ' + this.id;
          }
        }
      });

      cur_context = str;
    } else {
      cur_context = null;
    }
    $('#cur_context_panel').toggle(!!context).html(link_str);

  }

  function elementChanged(window,elems){
    
    const mode = svgCanvas.getMode();

    // if the element changed was the svg, then it could be a resolution change
    if (elems[0].tagName === "svg")  return editor.canvas.update();

    editor.panel.updateContextPanel(elems);
    
    svgCanvas.runExtensions("elementChanged", {
      elems: elems
    });

    state.set("canvasContent", svgCanvas.getSvgString())
  }

  function changeAttribute(attr, value, completed) {
    if (attr === "opacity") value *= 0.01;
    if (completed) {
      svgCanvas.changeSelectedAttribute(attr, value);
      state.set("canvasContent", serializer.serializeToString(svgCanvas.getContentElem()));
    }
    else svgCanvas.changeSelectedAttributeNoUndo(attr, value);      
  }

  function elementTransition(window, elems){
      var mode = svgCanvas.getMode();
      var elem = elems[0];
      
      if(!elem) return;
      
      const multiselected = (elems.length >= 2 && elems[1] != null) ? elems : null;
      // Only updating fields for single elements for now
      if(!multiselected && mode === "rotate") {
        var rotate_string = 'rotate('+ svgCanvas.getRotationAngle(elem) + 'deg)';
        $('#tool_angle_indicator').css("transform", rotate_string);
      }
      svgCanvas.runExtensions("elementTransition", {
        elems: elems
      });
  }

  function moveSelected(dx,dy) {
    if (!_self.selected.length) return false;
    if(state.get("canvasSnap")) {
      // Use grid snap value regardless of zoom level
      var multi = svgCanvas.getZoom() * state.get("canvasSnapStep");
      dx *= multi;
      dy *= multi;
    }
    //$('input').blur()
    svgCanvas.moveSelectedElements(dx,dy);
  };

  function extensionAdded(wind, func){
    if (func.callback) func.callback()
  }

  function changeBlur(ctl, completed){
    // todo not receiving ctl
    const val = $('#blur').val();
    if (completed) {
      svgCanvas.setBlur(val, true);
    }
    else {
      svgCanvas.setBlurNoUndo(val);
    }
  }

  function changeRotationAngle(ctl){
    const val = document.getElementById("angle").value;
    const indicator = document.getElementById("tool_angle_indicator");
    const reorient = document.getElementById("tool_reorient");
    const preventUndo = true;

    svgCanvas.setRotationAngle(val, preventUndo);
    indicator.style.transform = 'rotate('+ val + 'deg)'
    reorient.classList.toggle("disabled", val === 0);

  }

  function exportHandler(window, data) {
    var issues = data.issues;
    
    if(!$('#export_canvas').length) {
      $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
    }
    var c = $('#export_canvas')[0];
    
    c.width = svgCanvas.contentW;
    c.height = svgCanvas.contentH;
    canvg(c, data.svg, {renderCallback: function() {
      var datauri = c.toDataURL('image/png');  
      if (!datauri) return false;
      var filename = "Method Draw Image";
      var type = 'image/png';
      var file = svgedit.utilities.dataURItoBlob(datauri, type);
      if (window.navigator.msSaveOrOpenBlob) // IE10+
          window.navigator.msSaveOrOpenBlob(file, filename);
      else { // Others
          var a = document.createElement("a"),
                  url = URL.createObjectURL(file);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function() {
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
          }, 0);
      }
    }});
  };

  function toggleWireframe() {
    editor.menu.flash($('#view_menu')); 
    $('#tool_wireframe').toggleClass('push_button_pressed');
    $("#svg_editor").toggleClass('wireframe');
  }

  function groupSelected(){
    // group
    if (_self.selected.length > 1) {
      editor.menu.flash($('#object_menu'));
      svgCanvas.groupSelectedElements();
    }
  };

  function ungroupSelected(){
    if(_self.selected.length === 1 && _self.selected[0].tagName === "g"){
      editor.menu.flash($('#object_menu'));
      svgCanvas.ungroupSelectedElement();
    }
  }

  function convertToPath(){
    if (!_self.selected.length) return;
    svgCanvas.convertToPath();
    var elems = svgCanvas.getSelectedElems();
    svgCanvas.selectorManager.requestSelector(elems[0]).reset(elems[0])
    svgCanvas.selectorManager.requestSelector(elems[0]).selectorRect.setAttribute("display", "none");
    svgCanvas.setMode("pathedit")
    svgCanvas.pathActions.toEditMode(elems[0]);
    svgCanvas.clearSelection();
    editor.panel.updateContextPanel();
  }

  this.selectedChanged = selectedChanged;
  this.elementChanged = elementChanged;
  this.changeAttribute = changeAttribute;
  this.contextChanged = contextChanged;
  this.elementTransition = elementTransition;
  this.switchPaint = switchPaint;
  this.save = save;
  this.undo = undo;
  this.redo = redo;
  this.clear = clear;
  this.duplicateSelected = duplicateSelected;
  this.deleteSelected = deleteSelected;
  this.cutSelected = cutSelected;
  this.copySelected = copySelected;
  this.pasteSelected = pasteSelected;
  this.moveToTopSelected = moveToTopSelected;
  this.moveUpSelected = moveUpSelected;
  this.moveToBottomSelected = moveToBottomSelected;
  this.moveDownSelected = moveDownSelected;
  this.moveSelected = moveSelected;
  this.convertToPath = convertToPath;
  this.reorientPath = reorientPath;
  this.escapeMode = escapeMode;
  this.extensionAdded = extensionAdded;
  this.changeBlur = changeBlur;
  this.changeRotationAngle = changeRotationAngle;
  this.exportHandler = exportHandler;
  this.toggleWireframe = toggleWireframe;
  this.groupSelected = groupSelected;
  this.ungroupSelected = ungroupSelected;
  this.convertToPath = convertToPath;
  this.export = function(){ 
    if(window.canvg) {
        svgCanvas.rasterExport();
      } else {
        $.getScript('js/lib/rgbcolor.js', function() {
          $.getScript('js/lib/canvg.js', function() {
            svgCanvas.rasterExport();
          });
        });
      }}
}