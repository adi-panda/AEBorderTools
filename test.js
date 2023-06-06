var nullLayerNames = ["Shape Layer 1: Path 1 [1.1.0]","Shape Layer 1: Path 1 [1.1.1]","Shape Layer 1: Path 1 [1.1.2]","Shape Layer 1: Path 1 [1.1.3]"]; 
var origPath = thisProperty; 
var origPoints = origPath.points(); 
var origInTang = origPath.inTangents(); 
var origOutTang = origPath.outTangents(); 
var getNullLayers = []; 
for (var i = 0, il = nullLayerNames.length; i < il; i++){ 
    try{  
        getNullLayers.push(effect(nullLayerNames[i])("ADBE Layer Control-0001")); 
    } catch(err) { 
        getNullLayers.push(null); 
    }} 
for (var i = 0, il = getNullLayers.length; i < il; i++){ 
    if (getNullLayers[i] != null && getNullLayers[i].index != thisLayer.index){ 
        origPoints[i] = fromCompToSurface(getNullLayers[i].toComp(getNullLayers[i].anchorPoint));  
    }} 
createPath(origPoints,origInTang,origOutTang,origPath.isClosed());