
var canvas;
var gl;

var model_1;

var numSubdivs  = 5;

var pointsArray = [];
var normalsArray = [];

var near = 0.1;
var far = 5;
var radius = 4;
var theta  = 0.0;
var dr =  Math.PI/180.0;

var modelViewMatrix, projectionMatrix, nMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var orbit = true;

var g_objDoc = null;      // The information of OBJ file
var g_drawingInfo = null; // The information for drawing 3D model

function initObject(gl,obj_filename, scale){
    gl.program.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.program.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    gl.program.a_Color = gl.getAttribLocation(gl.program, 'a_Color');

    var model = initVertexBuffers(gl);

    readOBJFile(obj_filename, gl, model, scale, true);

    return model;
}

function initVertexBuffers(gl, program) {
    var o = new Object(); // Utilize Object object to return multiple buffer objects
    o.vertexBuffer = createEmptyArrayBuffer(gl, gl.program.a_Position, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, gl.program.a_Normal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, gl.program.a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return o;
}

  // Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    console.log(a_attribute);
    var buffer =  gl.createBuffer();  // Create a buffer object
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

    return buffer;
}

  // Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status !== 404) {
        onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
      }
    }
    request.open('GET', fileName, true); // Create a request to acquire the file
    request.send();                      // Send the request
}

  // OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse); // Parse the file
    if (!result) {
      g_objDoc = null; g_drawingInfo = null;
      console.log("OBJ file parsing error.");
      return;
    }
    g_objDoc = objDoc;
}

  // OBJ File has been read compreatly
function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();

    console.log(drawingInfo.vertices);

    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}


window.onload = function init() {

    canvas = document.getElementById( "webgl" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.clearColor( 0.5, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);

    gl.program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( gl.program );

    model_1 = initObject(gl, "../models/teapot.obj", 1);

    modelViewMatrixLoc = gl.getUniformLocation( gl.program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( gl.program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( gl.program, "nMatrix" );

    render();

}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (orbit){
        theta += dr;
    }

    eye = vec3(radius*Math.sin(theta),
        0, radius*Math.cos(theta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(45.0, 1.0, near, far);

    nMatrix = normalMatrix(modelViewMatrix,true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix) );


    if(!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()){
        g_drawingInfo = onReadComplete(gl,model_1,g_objDoc);
    }
    if(!g_drawingInfo){
	requestAnimationFrame(render);
	return;
    }

    gl.drawElements( gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0 );

    requestAnimationFrame(render);

}
