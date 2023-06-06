const isolateBorder = (border : ShapeLayer): Layer => {
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

const recursiveBorderCreation = (iteration : number, selectedShapeLayer : ShapeLayer, baseLayer : Layer, 
                                  counter : number, comp : CompItem, currentLayerIndex : number, newLayer : ShapeLayer ) => {
  //alert('iteration: ' + iteration + ' counter: ' + counter + ' currentLayerIndex: ' + currentLayerIndex + ' newLayer: ' + newLayer.name + 
    //                          ' selectedShapeLayer: ' + selectedShapeLayer.name + ' baseLayer: ' + baseLayer.name);
  if(iteration == 1){
    //alert("done");
    app.beginUndoGroup("Undo1");
    selectedShapeLayer.remove();
    //alert(baseLayer.name);  
    baseLayer.remove();
    newLayer.remove();
    return;
  }
  app.beginUndoGroup("Undo2");
  var newShape = newLayer.property("Contents");
  newLayer.name = newShape.property(counter).name;

  if(newShape instanceof PropertyGroup){
    for (var k = 1; k != newShape.numProperties; k++) {
      for (var k = newShape.numProperties; k > 0; k--) {
        if (k !== counter) {
          newShape.property(k).remove();
        }
      }
    }
  }
  $.writeln("tse");
  var baseLayerDuplicate = baseLayer.duplicate();
  baseLayerDuplicate.moveAfter(newLayer);
  var borderPosition =  newLayer.property("Contents")(1)("Transform")("Position");

  var xTransformDistance = 0;
  var yTransformDistance = 0;
  if(borderPosition instanceof Property){
    xTransformDistance = borderPosition.value[0];
    yTransformDistance = borderPosition.value[1];
    baseLayerDuplicate.position.setValue([baseLayerDuplicate.position.value[0] - borderPosition.value[0],
                                          baseLayerDuplicate.position.value[1] - borderPosition.value[1]]);
    borderPosition.setValue([0,0]);
  }

  $.writeln("huh!dsada" + iteration);
  var borderPath = newLayer.property("Contents")(1)("Contents")(1);
  app.executeCommand(2004); //deselct all
  borderPath.selected = true;

  app.executeCommand(4162); //convert to bezier path  
  if (iteration > 1) {
    // Schedule the next iteration using setTimeout
    app.setTimeout(function() {
      //alert("tests");
      //alert("yoman");
      app.beginUndoGroup("Undo3");
      var borderDuplicate = isolateBorder(newLayer);
      var originalPointVertices = [];
      var pointNames = [];
      borderPath = borderDuplicate.property("Contents")(1)("Contents")(1)("Path");
      if(borderPath instanceof Property){
        originalPointVertices = borderPath.value.vertices;
        for (var originalPointCount = 1; originalPointCount <= originalPointVertices.length; originalPointCount++) {
          pointNames.push(`comp("${comp.name}").layer("🔥${newLayer.name}").effect("Point ${originalPointCount}")("Point")`);
        }
        borderPath.expression = `createPath(points = [${pointNames}], inTangents = [], outTangents = [], isClosed = true)`;
      }

      var borderPath2 = newLayer.property("Contents")(1)("Contents")(1)("Path");

      if(borderPath2 instanceof Property){
        borderPath2.expression = `createPath(points = [${pointNames}], inTangents = [], outTangents = [], isClosed = true)`;
      }
    
      var newComp = comp.layers.precompose([newLayer.index, borderDuplicate.index, 
                      baseLayerDuplicate.index], "🔥" + newLayer.name, true);
      comp.layers[currentLayerIndex].label = 9; //green color
      //adjust position of new comp
      var oldPosition = comp.layers[currentLayerIndex].position.value;
      comp.layers[currentLayerIndex].position.setValue([oldPosition[0] + xTransformDistance, oldPosition[1] + yTransformDistance]);


      var currentBorderLayerEffects = comp.layers[currentLayerIndex].property("ADBE Effect Parade");

      if(currentBorderLayerEffects instanceof PropertyGroup){
        for (var originalPointCount = 1; originalPointCount <= originalPointVertices.length; originalPointCount++) {
          var point = currentBorderLayerEffects.addProperty("ADBE Point Control");
          point.name = "Point " + originalPointCount;
          var pointVal = point.property("ADBE Point Control-0001");
          if(pointVal instanceof Property){
            pointVal.setValue(originalPointVertices[originalPointCount - 1]);
          }
        }
      }

      currentLayerIndex++;
      
      //alert("test" + selectedShapeLayer.name);
      recursiveBorderCreation(iteration - 1, selectedShapeLayer, baseLayer, counter + 1, comp, currentLayerIndex, 
            selectedShapeLayer.duplicate() as ShapeLayer);
      return;
    }, 300);
  }
  
}




(function testScript() {
  app.beginUndoGroup("Test Script");
  if (app.project.activeItem instanceof CompItem) {
    var comp = app.project.activeItem;

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
    
    var currentLayerIndex = selectedShapeLayer.index;   

    //Duplicate layer delete all shapes after the first
    if (selectedShapeLayer instanceof ShapeLayer) {
        var shapes = selectedShapeLayer.property("Contents");
        if(shapes instanceof PropertyGroup){
          recursiveBorderCreation(shapes.numProperties + 1 , selectedShapeLayer, baseLayer, 1, comp, currentLayerIndex, 
                                  selectedShapeLayer.duplicate() as ShapeLayer);
          
      }
    }

  } else{
    alert("Please select a composition");
  }


})();


