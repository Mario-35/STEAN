function onDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  function onDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // it's a copy!
  }
  function onDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log("=================================");
    console.log(dragText);

    jsonDatas.string_value = dragText;
    jsonDatas.format();
  
    // var files = evt.dataTransfer.files;// object FileList
    // for (var i = 0; i < files.length; i++) {
    //  if(files[i].type == "text/plain"){
    //   var reader = new FileReader();
    //   reader.onload = function(event) {
    //     dropzone.value += event.target.result; 
    //     //console.log(event.target)
    //   }
    //   //instanceOfFileReader.readAsText(blob[, encoding]);
    //   reader.readAsText(files[i], "UTF-8");
    // }else{
    //     console.log(files[i].type);

    //     jsonDatas.string_value = files[i].type;
    //     jsonDatas.format();
    // }
    // }  
  }