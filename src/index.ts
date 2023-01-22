(function testScript() {
  app.beginUndoGroup("Test Script");

  if (app.project.activeItem instanceof CompItem) {
    const comp = app.project.activeItem;

    if(comp.selectedLayers.length != 2){
      alert("Please select a base layer and a shape layer!");
      return;
    }

    if(comp.selectedLayers[0].index > comp.selectedLayers[1].index){
      var selectedShapeLayer = comp.selectedLayers[1];
      var baseLayer = comp.selectedLayers[0];
    } else {
      var selectedShapeLayer = comp.selectedLayers[0];
      var baseLayer = comp.selectedLayers[1];
    }
        


    //Duplicate layer delete all shapes after the first
    if (selectedShapeLayer instanceof ShapeLayer) {
        var shapes = selectedShapeLayer.property("Contents");
        if(shapes instanceof PropertyGroup){
          for (var j = 1; j <= shapes.numProperties; j++) {
              var newLayer = selectedShapeLayer.duplicate();
              var newShape = newLayer.property("Contents");
              newLayer.name = newShape.property(j).name;

              if(newShape instanceof PropertyGroup){
                for (var k = 1; k != newShape.numProperties; k++) {
                  for (var k = newShape.numProperties; k > 0; k--) {
                    if (k !== j) {
                      newShape.property(k).remove();
                    }
                  }
                }
              }

              var baseLayerDuplicate = baseLayer.duplicate();
              baseLayerDuplicate.moveAfter(newLayer);
              if(newLayer instanceof ShapeLayer){
                var borderDuplicate = isolateBorder(newLayer);
                comp.layers.precompose([newLayer.index, borderDuplicate.index, 
                               baseLayerDuplicate.index], newLayer.name, true);
              }
          }


          selectedShapeLayer.remove();
          baseLayer.remove();

      }
    }
  } else{
    alert("Please select a composition");
  }

  app.endUndoGroup();

})();

function isolateBorder(border : ShapeLayer): Layer {
  var newLay = border.duplicate();
  newLay.name = "borderDuplicate";
  var fillOpacity = border.property("Contents").property(1).property("Contents").
          property("Fill 1").property("Opacity");
  if(fillOpacity instanceof Property){
    fillOpacity.setValue(100);
  }
  var strokeOpacity = border.property("Contents").property(1).property("Contents").
          property("Stroke 1").property("Opacity");
  if(strokeOpacity instanceof Property){
    strokeOpacity.setValue(0);
  }
  if(border instanceof ShapeLayer){
    border.blendingMode = BlendingMode.STENCIL_ALPHA;
  }
  return newLay;
}