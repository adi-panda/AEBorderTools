
(function testScript() {
  
  app.beginUndoGroup("Test Script");
  if (app.project.activeItem instanceof CompItem) {
    const comp = app.project.activeItem;
    const curr = comp.selectedLayers[0];
    var newLay = curr.duplicate();
    newLay.name = "mangaPanelDuplicate";
    newLay.moveAfter(curr);
    //set fill of current layer to black
    (newLay.property("Contents").property(1).property("Contents").property("Fill 1").property("Opacity") as Property<Number>).setValue(100);
    (newLay.property("Contents").property(1).property("Contents").property("Stroke 1").property("Opacity") as Property<Number>).setValue(0);
    (newLay as AVLayer).blendingMode = BlendingMode.STENCIL_ALPHA;

  }

  app.endUndoGroup();
})();
