import {applyBorderPreset} from "./Apply Pseudo Effect as Animation Preset";

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
      //@ts-ignore
      originalPointVertices = borderPath.value.vertices;

      if(borderPath instanceof Property){
        for (var originalPointCount = 1; originalPointCount <= originalPointVertices.length; originalPointCount++) {
          pointNames.push(`fromComp(comp("${comp.name}").layer("🔥${newLayer.name}").effect("Pseudo/YourCustomControl_v1")("Point ${originalPointCount}").value)`);
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


      applyBorderPreset(comp.layers[currentLayerIndex]);
      
      var addExpression = true;
      for (var originalPointCount = 1; originalPointCount <= originalPointVertices.length; originalPointCount++) {
        var pointVal = comp.layers[currentLayerIndex].property("ADBE Effect Parade")("Pseudo/YourCustomControl_v1")("Point " + originalPointCount );
        if(pointVal instanceof Property){
          pointVal.setValue(selectedShapeLayer.sourcePointToComp(originalPointVertices[originalPointCount - 1]));
          originalPointVertices[originalPointCount - 1] = selectedShapeLayer.sourcePointToComp(originalPointVertices[originalPointCount - 1]);
          if(addExpression){
            pointVal.expression = ` var top = effect("Pseudo/YourCustomControl_v1")("Top") / 100;
                                    var bottom = effect("Pseudo/YourCustomControl_v1")("Bottom") / 100;
                                    var left = effect("Pseudo/YourCustomControl_v1")("Left") / 100;
                                    var right = effect("Pseudo/YourCustomControl_v1")("Right") / 100;

                                    var p1x = ${originalPointVertices[0][0]};
                                    var p1y = ${originalPointVertices[0][1]};
                                    var p2x = ${originalPointVertices[1][0]};
                                    var p2y = ${originalPointVertices[1][1]};
                                    var p3x = ${originalPointVertices[2][0]};
                                    var p3y = ${originalPointVertices[2][1]};
                                    var p4x = ${originalPointVertices[3][0]};
                                    var p4y = ${originalPointVertices[3][1]};

                                    var minX = Math.min(p1x, p2x, p3x, p4x);
                                    var maxX = Math.max(p1x, p2x, p3x, p4x);
                                    var initialWidth = maxX - minX;

                                    var minY = Math.min(p1y, p2y, p3y, p4y)
                                    var maxY = Math.max(p1y, p2y, p3y, p4y)
                                    var initialHeight = maxY - minY

                                    var newWidth = initialWidth * (1 - left - right);
                                    var newHeight = initialHeight * (1 - top - bottom);
                                  
                                    newX1 = p1x + newWidth * left;
                                    newY1 = p1y + newHeight * top;
                                    newX2 = p2x - newWidth * right;
                                    newY2 = p2y - newHeight * bottom;
                                    newX3 = p3x + newWidth * left;
                                    newY3 = p3y - newHeight * bottom;
                                    newX4 = p4x - newWidth * right;
                                    newY4 = p4y + newHeight * top;
                                    [newX${originalPointCount}, newY${originalPointCount}];

                                  `;

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


